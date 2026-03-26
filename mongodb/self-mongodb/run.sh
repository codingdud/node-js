docker run -d `
--name my-mongo `
-p 27017:27017 `
-v ${PWD}/mongo-data:/data/db `
-e MONGO_INITDB_ROOT_USERNAME=mongoadmin `
-e MONGO_INITDB_ROOT_PASSWORD=secret `
mongo:latest

# backup data

docker exec my-mongo mongodump `
--username mongoadmin `
--password secret `
--authenticationDatabase admin `
--db orgDev `
--out /data/db/backup
# copy data to my system
docker cp my-mongo:/data/db/backup ./backup


docker exec -it my-mongo bash

mongodump --username mongoadmin --password secret --authenticationDatabase admin --db orgDev --out /data/db/backup

# copy back to containner
docker cp ./backup my-mongo:/backup

docker exec my-mongo mongorestore `
--username mongoadmin `
--password secret `
--authenticationDatabase admin `
--db orgDev `
/backup/orgDev

mongorestore --username mongoadmin --password secret --authenticationDatabase admin --db orgDev /backup/orgDev