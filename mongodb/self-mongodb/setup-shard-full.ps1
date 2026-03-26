# Create network
docker network create mongo-shard

# ── CONFIG SERVERS (3 nodes, all on port 27019 internally) ──
docker run -d --name config1 --network mongo-shard -p 27019:27019 mongo:latest mongod --configsvr --replSet rs-config --port 27019 --dbpath /data/configdb
docker run -d --name config2 --network mongo-shard -p 27020:27019 mongo:latest mongod --configsvr --replSet rs-config --port 27019 --dbpath /data/configdb
docker run -d --name config3 --network mongo-shard -p 27021:27019 mongo:latest mongod --configsvr --replSet rs-config --port 27019 --dbpath /data/configdb

Start-Sleep -Seconds 5

docker exec -it config1 mongosh --port 27019 --eval "
rs.initiate({
  _id: 'rs-config',
  configsvr: true,
  members: [
    { _id: 0, host: 'config1:27019' },
    { _id: 1, host: 'config2:27019' },
    { _id: 2, host: 'config3:27019' }
  ]
})"

Start-Sleep -Seconds 10

# ── SHARD 1 (3 nodes, all on port 27018 internally) ──────────
docker run -d --name shard1_1 --network mongo-shard -p 27030:27018 mongo:latest mongod --shardsvr --replSet rs-shard1 --port 27018 --dbpath /data/db
docker run -d --name shard1_2 --network mongo-shard -p 27031:27018 mongo:latest mongod --shardsvr --replSet rs-shard1 --port 27018 --dbpath /data/db
docker run -d --name shard1_3 --network mongo-shard -p 27032:27018 mongo:latest mongod --shardsvr --replSet rs-shard1 --port 27018 --dbpath /data/db

# ── SHARD 2 (3 nodes, all on port 27021 internally) ──────────
docker run -d --name shard2_1 --network mongo-shard -p 27033:27021 mongo:latest mongod --shardsvr --replSet rs-shard2 --port 27021 --dbpath /data/db
docker run -d --name shard2_2 --network mongo-shard -p 27034:27021 mongo:latest mongod --shardsvr --replSet rs-shard2 --port 27021 --dbpath /data/db
docker run -d --name shard2_3 --network mongo-shard -p 27035:27021 mongo:latest mongod --shardsvr --replSet rs-shard2 --port 27021 --dbpath /data/db

# ── SHARD 3 (3 nodes, all on port 27023 internally) ──────────
docker run -d --name shard3_1 --network mongo-shard -p 27036:27023 mongo:latest mongod --shardsvr --replSet rs-shard3 --port 27023 --dbpath /data/db
docker run -d --name shard3_2 --network mongo-shard -p 27037:27023 mongo:latest mongod --shardsvr --replSet rs-shard3 --port 27023 --dbpath /data/db
docker run -d --name shard3_3 --network mongo-shard -p 27038:27023 mongo:latest mongod --shardsvr --replSet rs-shard3 --port 27023 --dbpath /data/db

Start-Sleep -Seconds 5

# Init all 3 shard replica sets
docker exec -it shard1_1 mongosh --port 27018 --eval "rs.initiate({_id:'rs-shard1',members:[{_id:0,host:'shard1_1:27018'},{_id:1,host:'shard1_2:27018'},{_id:2,host:'shard1_3:27018'}]})"
docker exec -it shard2_1 mongosh --port 27021 --eval "rs.initiate({_id:'rs-shard2',members:[{_id:0,host:'shard2_1:27021'},{_id:1,host:'shard2_2:27021'},{_id:2,host:'shard2_3:27021'}]})"
docker exec -it shard3_1 mongosh --port 27023 --eval "rs.initiate({_id:'rs-shard3',members:[{_id:0,host:'shard3_1:27023'},{_id:1,host:'shard3_2:27023'},{_id:2,host:'shard3_3:27023'}]})"

Start-Sleep -Seconds 10

# ── MONGOS ROUTER ─────────────────────────────────────────────
docker run -d `
  --name mongos `
  --network mongo-shard `
  -p 27017:27017 `
  mongo:latest `
  mongos --configdb rs-config/config1:27019,config2:27019,config3:27019 --bind_ip_all --port 27017

Start-Sleep -Seconds 5

# ── ADD SHARDS + ENABLE SHARDING ──────────────────────────────
docker exec -it mongos mongosh --port 27017 --eval "
sh.addShard('rs-shard1/shard1_1:27018,shard1_2:27018,shard1_3:27018');
sh.addShard('rs-shard2/shard2_1:27021,shard2_2:27021,shard2_3:27021');
sh.addShard('rs-shard3/shard3_1:27023,shard3_2:27023,shard3_3:27023');

sh.enableSharding('usersDB');
sh.enableSharding('ordersDB');
sh.enableSharding('productsDB');

sh.shardCollection('usersDB.users',       { userId:    'hashed' });
sh.shardCollection('ordersDB.orders',     { orderId:   'hashed' });
sh.shardCollection('productsDB.products', { productId: 'hashed' });
"

Write-Host "✅ Cluster Ready!"
Write-Host "Connect: mongodb://localhost:27017/?directConnection=true"
