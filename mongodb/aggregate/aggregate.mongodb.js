// aggregate is processing multiple doument and compute result on bases of those docs
// comparison operators work with $match, $expr ,$cond
// $gt $lt $eq $gte $lte $ne $in %nin
use("aggregationDB")

db.users.aggregate([
  {$match: {age:{
    $gte:20
  }}}
])
// aggregate pipeline is one or multiple stages where one stage output is input for onother stage here sequence mater
// [$match, $group, $project, $sort, $limt]

use("aggregationDB")
db.orders.aggregate([
  {$match: {
    year:{$lte:2024}
  }}
])

use("aggregationDB")
db.inventory.aggregate([
  {$group: {
    _id: "$productId",
    soldtotal: {
      $sum: "$sold"
    },
    totalquantity:{
      $avg:"$quantity"
    }
  }}
])

// project output shap include and exclude or rename

use("aggregationDB")
db.orders.aggregate([
  {$project: {
    _id:0, // 0 exclude 1 include
    status:1,
    discountPrice:{$multiply:["$amount","$discount"]},
    userName:"$userId"
  }}
])

// $sort
use("aggregationDB")
db.orders.aggregate([
  {$project: {
    _id:0, // 0 exclude 1 include
    status:1,
    discountPrice:{$multiply:["$amount","$discount"]},
    userName:"$userId"
  }},
  // sort the  arr result 
  {$sort:{"discountPrice":-1}},
  // limit the result to 5
  {$skip:1},
  {$limit:4},

])

// lookup join with other collections
use("aggregationDB")
db.orders.aggregate([
  {$lookup: {
    from: "users",
    localField: "userId",
    foreignField: "_id",
    as: "userDetails"
  }}
])

// pipline and sub-query

db.orders.aggregate([
  {$lookup: {
    from: "products",
    let:{orderId:"$_id",minQty:2},
    pipeline:[
      {$match: {
        $expr:{
          $and:[
            {$eq:["$orderId","$$oderId"]}

          ]
        }
      }}
    ]
  }}
])


use("aggregationDB")
// db.products.aggregate([
//   {$unwind: {
//     path: "$tags",
//     includeArrayIndex: 'string',
//     preserveNullAndEmptyArrays: true
//   }}
// ])

db.products.aggregate([
  {$limit:1},
  {$unwind:"$tags"}
])

// add new field $addField $set  
use("aggregationDB")
db.orders.aggregate([
  {$set: {
    totalAmount: {$sum:"$items.price"},
  }}
])
// replace root data
use("aggregationDB")
db.orders.aggregate([
  {$replaceRoot:{newRoot:{
    $mergeObjects:["$$ROOT",{source:"mongo"}]
  }}}
])


// run multiple pipeline and parallel on same input
use("aggregationDB")
db.products.aggregte([
  {$facet: {
    catagoriesCount: [{$group: {
      _id: "$category",
      count: {
        $sum: 1
      }
    }}],
    printStats:[{$group:{
      _id:"null",
      minprice:{$min:"$price"},
      maxprice:{$max:"$price"},
      avgprice:{$avg:"$price"}
    }}],
    
  }}
])
// defined doument into user defined range
use("aggregationDB")
db.products.aggregate([
  {$bucket:{
    groupBy:"$price",
    boundaries:[0,50,100,500,1000],
    default:"other",
    output:{
      count:{$sum:1},
      avgPrice:{$avg:"$price"}
    }
  }}
])

use("aggregationDB")
db.products.aggregate([
  {$bucketAuto: {
    groupBy: "$rating",
    buckets: 2,
    output: {
      count:{$sum:1},
      avgPrice:{$avg:"$rating"}
    },
  }}
])

// count the $expr $match $group

use("aggregationDB")
db.orders.aggregate([
  {$match:{status:"completed"}},
  {$count: 'count'}
])

// accumulator operators $sum $avg $min $max $first $last $push
// $count use with $group or $match
use("aggregationDB")
db.sales.aggregate([
  {$group: {
    _id: "$region",
    totoal:{$sum:1},
    avg:{$avg:"$revenue"},
    high:{$max:"$revenue"},
    low:{$min:"$revenue"},
    firstsale:{$first:"$date"},
    allsalesman:{$push:"$salesman"}
    
  }},
 // {$count:"count"},
])

// array opreration 
use("aggregationDB")
db.orders.aggregate([
  {$project:{
    itemCount:{$size:"$items"},
    expens:{$filter:{
      input:"$items",
      as:'item',
      cond:{$gt:["$$item.price",100]}
    }},
    itemName:{$map:{
      input:"$items",
      as:"item",
      in:"$$item.name",
    }},
    totalcost:{$reduce:{
      input:"$items",
      initialValue:0,
      in:{$add:["$$value","$$this.price"]}
    }},
    firstone:{$slice:["$items",1]},
    lastone:{$slice:["$items",-1]},
    hascatagory:{$in:["Appliances","$items.category"]},
    sortbyprice:{
      $sortArray:{
        input:"$items",
        sortBy:{"price":1}
      }
    }
  }}
])

// string operations

use("aggregationDB")
db.users.aggregate([
  {$project: {
    fullname:{$concat:["$firstName"," ","$lastName"]},
    upperMail:{$toUpper:"$email"},
    lowername:{$toLower:"$name"},
    intial:{$substr:["$name",0,2]},
    namelen:{$strLenCP:"$name"},
    trim:{$trim:{input:"$name"}},
    namepartts:{$split:["$name"," "]}
  }}
])

// date operation
use("aggregationDB")
db.orders.aggregate([
  {$project: {
    year:{$year:"$createdAt"},
    month:{$month:"$createdAt"},
    day:{$dayOfMonth:"$createdAt"},
    hour:{$hour:"$createdAt"},
    minu:{$minute:"$createdAt"},
    dayofweek:{$dayOfWeek:"$createdAt"},
    week:{$week:"$createdAt"},
    foramteDate:{$dateToString:{
      format:"%Y-%m-%d %H:%M:%S",
      date:"$createdAt",
    }}
  }}
])

// $cond ternary operator
use("aggregationDB")
db.orders.aggregate([
  {$project: {
    discout:{$cond:[{$gt:["$amount",500]},0.1,0]}
  }}
])

// $expr work in match for enable 
use("aggregationDB")
db.inventory.aggregate([
  {$match: {
    $expr:{$gt:["$sold","$stock"]}
  }}
])

use("aggregationDB")
db.sales.aggregate([
  {$match: {
    $expr:{$and:[
      {$gte:["$revenue",1000]},
      {$lte:["$cost","$revenue"]}
    ]}
  }}
])

//write back to collection $merge and $out