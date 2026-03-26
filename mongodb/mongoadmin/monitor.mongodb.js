use('admin')
db.stats()
db.serverStatus()
db.getMongo().getDBNames()
db.hostInfo()
db.version()



// creating and using database
use("orgDev")
db.createCollection("users")
console.log(db.getCollectionNames())
db.users.insert({name:"alice",potion:"software developer"})

use("orgDev")
//db.users.drop()
//db.dropDatabase()