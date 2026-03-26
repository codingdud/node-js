// Auto-initialization script for MongoDB sharding
sleep(5000); // Wait for cluster to be ready

// Enable sharding on database
sh.enableSharding("myDatabase");

// Add zone tags to shards
sh.addShardTag("rs-shard1", "zone1");
sh.addShardTag("rs-shard2", "zone2");
sh.addShardTag("rs-shard3", "zone3");

// Define zone ranges
sh.addTagRange("myDatabase.users", { userId: 1 }, { userId: 101 }, "zone1");
sh.addTagRange("myDatabase.users", { userId: 101 }, { userId: 201 }, "zone2");
sh.addTagRange("myDatabase.users", { userId: 201 }, { userId: 301 }, "zone3");

// Shard the collection
sh.shardCollection("myDatabase.users", { userId: 1 });

print("Zone-based sharding configured successfully!");