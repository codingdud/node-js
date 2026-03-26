# MongoDB Sharding Setup Script for Windows

# Create network
docker network create mongo-shard

# 1. Start Config Servers (3 nodes)
docker run -d --name config1 --network mongo-shard -p 27019:27019 mongo:latest mongod --configsvr --replSet rs-config --port 27019
docker run -d --name config2 --network mongo-shard -p 27020:27020 mongo:latest mongod --configsvr --replSet rs-config --port 27020
docker run -d --name config3 --network mongo-shard -p 27022:27022 mongo:latest mongod --configsvr --replSet rs-config --port 27022

Start-Sleep -Seconds 5

# Initialize config server replica set
docker exec -it config1 mongosh --port 27019 --eval "rs.initiate({_id:'rs-config',configsvr:true,members:[{_id:0,host:'config1:27019'},{_id:1,host:'config2:27020'},{_id:2,host:'config3:27022'}]})"

Start-Sleep -Seconds 10

# 2. Start Shard Servers
docker run -d --name shard1 --network mongo-shard -p 27018:27018 mongo:latest mongod --shardsvr --replSet rs-shard1 --port 27018
docker run -d --name shard2 --network mongo-shard -p 27021:27021 mongo:latest mongod --shardsvr --replSet rs-shard2 --port 27021
docker run -d --name shard3 --network mongo-shard -p 27023:27023 mongo:latest mongod --shardsvr --replSet rs-shard3 --port 27023

Start-Sleep -Seconds 5

# Initialize shard replica sets
docker exec -it shard1 mongosh --port 27018 --eval "rs.initiate({_id:'rs-shard1',members:[{_id:0,host:'shard1:27018'}]})"
docker exec -it shard2 mongosh --port 27021 --eval "rs.initiate({_id:'rs-shard2',members:[{_id:0,host:'shard2:27021'}]})"
docker exec -it shard3 mongosh --port 27023 --eval "rs.initiate({_id:'rs-shard3',members:[{_id:0,host:'shard3:27023'}]})"

Start-Sleep -Seconds 10

# 3. Start Mongos Router with init script
docker run -d `
  --name mongos `
  --network mongo-shard `
  -p 27017:27017 `
  -v ${PWD}/init-sharding.js:/docker-entrypoint-initdb.d/init-sharding.js `
  mongo:latest `
  mongos --configdb rs-config/config1:27019,config2:27020,config3:27022 --bind_ip_all --port 27017

Start-Sleep -Seconds 5

# 4. Add shards to cluster
docker exec -it mongos mongosh --port 27017 --eval "sh.addShard('rs-shard1/shard1:27018')"
docker exec -it mongos mongosh --port 27017 --eval "sh.addShard('rs-shard2/shard2:27021')"
docker exec -it mongos mongosh --port 27017 --eval "sh.addShard('rs-shard3/shard3:27023')"

Write-Host "Sharding cluster setup complete!"
Write-Host "Run range-based-sharding.mongodb.js to configure zone sharding"
Write-Host "Connect to: mongosh --port 27017"
