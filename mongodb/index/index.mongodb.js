// collection scan reading every docs(O(n))with index , it performs a fast index(O(log n)) scan on small set of B-tree
// mongodb use b-tree for indexing

const { use } = require("react")

// support range query, sort, match,
use("aggregationDB")
db.users.createIndex({age:1}) //assending order index
db.users.createIndex({name:-1}) //desandeing order index
db.users.createIndex({address:1}) // index on nested object
db.users.createIndex({"address.city":1}) // index on nested object field

use("aggregationDB")
db.users.find({age:31})
db.users.find({age:{$gt:18,$lt:50}})

// compound index on mutple fild 
db.users.createIndex({name:1,age:-1})

// muttikey indexing
db.orders.createIndex({items:1})


// enable full-text search on string field
use("aggregationDB")
db.users.createIndex({email:"text"})
db.users.createIndex({"address.$**":"text"})
// wild card text index
db.users.find({$text:{$search:"gmail"}})


// geospatial index
db.users.createIndex({location:"2dsphere"})
db.users.createIndex({ userId: "hashed" })
// unique index
db.users.createIndex({email:"text"},{unique:true})
db.users.createIndex({email:1},{sparse:true})

