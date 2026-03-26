function waitForPing(connString, label) {
  let attempts = 60;
  while (attempts > 0) {
    try {
      const db = new Mongo(connString).getDB("admin");
      const result = db.runCommand({ ping: 1 });
      if (result && result.ok === 1) {
        print(`ready: ${label}`);
        return;
      }
    } catch (e) {
      // Retry until the service is reachable.
    }
    attempts--;
    sleep(2000);
  }
  throw new Error(`timeout waiting for ${label}`);
}

function runAdminCommand(connString, command, label) {
  const admin = new Mongo(connString).getDB("admin");
  try {
    const result = admin.runCommand(command);
    print(`${label}: ${JSON.stringify(result)}`);
    return result;
  } catch (e) {
    const msg = `${e}`;
    if (
      msg.includes("already initialized") ||
      msg.includes("AlreadyInitialized") ||
      msg.includes("duplicate key") ||
      msg.includes("exists")
    ) {
      print(`${label}: already configured`);
      return { ok: 1, skipped: true };
    }
    throw e;
  }
}

function runMongosEval(js, label) {
  const admin = new Mongo("mongos:27017").getDB("admin");
  try {
    const result = admin.eval(js);
    print(`${label}: ${JSON.stringify(result)}`);
  } catch (e) {
    const msg = `${e}`;
    if (msg.includes("already exists") || msg.includes("DuplicateKey") || msg.includes("is already sharded")) {
      print(`${label}: already configured`);
      return;
    }
    throw e;
  }
}

waitForPing("config1:27019", "config1");
waitForPing("config2:27019", "config2");
waitForPing("config3:27019", "config3");
waitForPing("shard1_1:27018", "shard1_1");
waitForPing("shard1_2:27018", "shard1_2");
waitForPing("shard1_3:27018", "shard1_3");
waitForPing("shard2_1:27021", "shard2_1");
waitForPing("shard2_2:27021", "shard2_2");
waitForPing("shard2_3:27021", "shard2_3");
waitForPing("shard3_1:27023", "shard3_1");
waitForPing("shard3_2:27023", "shard3_2");
waitForPing("shard3_3:27023", "shard3_3");

runAdminCommand(
  "config1:27019",
  {
    replSetInitiate: {
      _id: "rs-config",
      configsvr: true,
      members: [
        { _id: 0, host: "config1:27019" },
        { _id: 1, host: "config2:27019" },
        { _id: 2, host: "config3:27019" }
      ]
    }
  },
  "init rs-config"
);

runAdminCommand(
  "shard1_1:27018",
  {
    replSetInitiate: {
      _id: "rs-shard1",
      members: [
        { _id: 0, host: "shard1_1:27018" },
        { _id: 1, host: "shard1_2:27018" },
        { _id: 2, host: "shard1_3:27018" }
      ]
    }
  },
  "init rs-shard1"
);

runAdminCommand(
  "shard2_1:27021",
  {
    replSetInitiate: {
      _id: "rs-shard2",
      members: [
        { _id: 0, host: "shard2_1:27021" },
        { _id: 1, host: "shard2_2:27021" },
        { _id: 2, host: "shard2_3:27021" }
      ]
    }
  },
  "init rs-shard2"
);

runAdminCommand(
  "shard3_1:27023",
  {
    replSetInitiate: {
      _id: "rs-shard3",
      members: [
        { _id: 0, host: "shard3_1:27023" },
        { _id: 1, host: "shard3_2:27023" },
        { _id: 2, host: "shard3_3:27023" }
      ]
    }
  },
  "init rs-shard3"
);

sleep(10000);

waitForPing("mongos:27017", "mongos");

runAdminCommand(
  "mongos:27017",
  { addShard: "rs-shard1/shard1_1:27018,shard1_2:27018,shard1_3:27018" },
  "add shard1"
);
runAdminCommand(
  "mongos:27017",
  { addShard: "rs-shard2/shard2_1:27021,shard2_2:27021,shard2_3:27021" },
  "add shard2"
);
runAdminCommand(
  "mongos:27017",
  { addShard: "rs-shard3/shard3_1:27023,shard3_2:27023,shard3_3:27023" },
  "add shard3"
);

runAdminCommand("mongos:27017", { enableSharding: "usersDB" }, "enable usersDB");
runAdminCommand("mongos:27017", { enableSharding: "ordersDB" }, "enable ordersDB");
runAdminCommand("mongos:27017", { enableSharding: "productsDB" }, "enable productsDB");

runAdminCommand(
  "mongos:27017",
  { shardCollection: "usersDB.users", key: { userId: "hashed" } },
  "shard usersDB.users"
);
runAdminCommand(
  "mongos:27017",
  { shardCollection: "ordersDB.orders", key: { orderId: "hashed" } },
  "shard ordersDB.orders"
);
runAdminCommand(
  "mongos:27017",
  { shardCollection: "productsDB.products", key: { productId: "hashed" } },
  "shard productsDB.products"
);

print("cluster init complete");
