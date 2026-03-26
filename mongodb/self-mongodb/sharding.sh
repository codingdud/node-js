# Shard 1 — single node replSet (simplest possible)
docker run -d `
  --name shard1 `
  --network mongo-shard `
  -p 27018:27018 `
  -v ${PWD}/shard1:/data/db `
  mongo:latest `
  mongod --shardsvr --replSet rs-shard1 --port 27018

# Shard 2
docker run -d `
  --name shard2 `
  --network mongo-shard `
  -p 27021:27021 `
  -v ${PWD}/shard2:/data/db `
  mongo:latest `
  mongod --shardsvr --replSet rs-shard2 --port 27021

# Shard 3
docker run -d `
  --name shard3 `
  --network mongo-shard `
  -p 27023:27023 `
  -v ${PWD}/shard3:/data/db `
  mongo:latest `
  mongod --shardsvr --replSet rs-shard3 --port 27023

Start-Sleep -Seconds 5

# Init each as SINGLE NODE replSet
docker exec -it shard1 mongosh --port 27018 --eval "rs.initiate({_id:'rs-shard1',members:[{_id:0,host:'shard1:27018'}]})"
docker exec -it shard2 mongosh --port 27021 --eval "rs.initiate({_id:'rs-shard2',members:[{_id:0,host:'shard2:27021'}]})"
docker exec -it shard3 mongosh --port 27023 --eval "rs.initiate({_id:'rs-shard3',members:[{_id:0,host:'shard3:27023'}]})"
```
