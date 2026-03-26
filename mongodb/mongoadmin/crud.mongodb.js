const { useId, use } = require("react")

use("usersDB")
// create one user
db.users.insertOne({
  userId:Math.random().toString(16).slice(2,9)
})
// create multple user
use("productsDB")
db.products.insertMany([
  {productId:Math.random().toString(7).slice(2,18)},
  {productId:Math.random().toString(7).slice(2,18)},
  {productId:Math.random().toString(7).slice(2,18)},
  {productId:Math.random().toString(7).slice(2,18)}
])
db.products.getShardDistribution()

// read data
use("usersDB")
//db.users.findOne({userId:"4609928"})
let user = db.users.find().limit(1)
user=user.toArray()
user=user[0];
console.log(user)


// update data
db.users.updateOne({useId:user.useId},{$set:{
  name:"jon the riper"
}})
db.users.updateMany({name:{$exists:true}},{$set:{status:"active"}})
db.users.replaceOne({userId:user.userId},{userId:user.userId,name:"Jane the riper - replaced",status:"active"})

// delete data
use("usersDB")
db.users.deleteOne({userId:user.userId})
db.users.deleteMany({userId:user.userId})

