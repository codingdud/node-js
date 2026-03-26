docker run -d `
--name mongo1 `
--network mongo-cluster `
-p 27017:27017 `
-v ${PWD}/mongo1:/data/db `
-v ${PWD}/init-replica.js:/docker-entrypoint-initdb.d/init-replica.js `
mongo:latest `
--replSet rs0

docker run -d `
--name mongo2 `
--network mongo-cluster `
-p 27018:27017 `
-v ${PWD}/mongo2:/data/db `
mongo:latest `
--replSet rs0

docker run -d `
--name mongo3 `
--network mongo-cluster `
-p 27019:27017 `
-v ${PWD}/mongo3:/data/db `
mongo:latest `
--replSet rs0

## using mongo.config 
docker run -d `
--name mongo1 `
--network mongo-cluster `
-p 27017:27017 `
-v ${PWD}/mongo1:/data/db `
-v ${PWD}/mongo.conf:/etc/mongo/mongo.conf `
-v ${PWD}/init-replica.js:/docker-entrypoint-initdb.d/init-replica.js `
mongo:latest `
mongod --config /etc/mongo/mongo.conf

# mongo.config
storage:
  dbPath: /data/db

net:
  bindIp: 0.0.0.0
  port: 27017

replication:
  replSetName: rs0