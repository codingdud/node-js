// Atomicity means an operation either completes fully or not at all 
// A - All or nothing — no partial writes
// C - one valid state to another
// I - each trassaction souldnot interfere
// D - commit data persist even system crash or stop


use("aggregationDB")
db.users.updateOne({age:30},{
  $set:{age:28},
})
db.users.updateOne({_id:1},{
  $inc:{age:1}
})
// safe concurrent with version field
db.users.updateOne({_id:1,__v:0},
  {$set:{age:29}, $inc:{__v:1}})
  // atomic read and write

db.users.findOneAndUpdate(
  {age:28},
  {$set:{age:27}},
)

//  true all-or-nothing multi-docs writes you need nned trhascations

use("aggregationDB")
const session=db.getMongo().startSession()
session.startTransaction()
try {
  const accounts = session.getDatabase("aggregationDB").getCollection("accounts")

  accounts.updateOne(
    { _id: "alice" },
    { $inc: { balance: -200 } }
  )

  accounts.updateOne(
    { _id: "bob" },
    { $inc: { balance: 200 } }
  )

  session.commitTransaction()
} catch (e) {
  session.abortTransaction()
  throw e
} finally {
  session.endSession()
}
// const { MongoClient } = require("mongodb")
// const client=new MongoClient()
// const sessioon=client.startSession()
// try 
// session.startTransaction({
//   readConcern:{level:"snapshot"},
//   writeConcern:{w:"majority"},
// })

// account =client.db().collections()

// catch

// finally
// session.endSession()