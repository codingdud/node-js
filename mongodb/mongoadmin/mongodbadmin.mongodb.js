// mongodb database admistration

use("admin")
if (!db.getUser("admin1")) {
  db.createUser({
    user:"admin1",
    pwd:"admin1",
    roles:["root"],
  })
}
if (!db.getUser("user1")) {
  db.createUser({
    user:"user1",
    pwd:"user1",
    roles:[
      {role:"readWrite",db:"mydb"},
      {role:"read",db:"otherdb"}
    ]
  })
}
if(!db.getRole("customRole")){
  db.createRole({
    role: "customRole",
    privileges: [
      {
        resource: { db: "myDatabase", collection: "users" },
        actions: ["find", "insert", "update", "remove"]
      },
      {
        resource: { db: "myDatabase", collection: "" },
        actions: ["listCollections"]
      }
    ],
    roles: [
      { role: "read", db: "otherDatabase" }
    ]
  })
}
db.updateRole("customRole", {
  privileges: [
    {
      resource: { db: "myDatabase", collection: "users" },
      actions: ["find", "insert", "update", "remove"]
    }
  ]
})
db.updateUser("admin1",{
  pwd:"change-pwd",
  roles:[{ role: "dbAdmin", db: "myDatabase" }]
})
db.changeUserPassword("user1","change-pwd")
db.grantRolesToUser("user1",[{role:"readWrite", db:"mydatabase"}])
console.log(db.getUsers())
db.revokeRolesFromUser("user1",[{role:"readWrite",db:"mydatabase"}])
console.log(db.getUser("user1"))
console.log(db.getRoles())

db.dropUser("user1")
db.dropUser("admin1")
db.dropRole("customRole")


