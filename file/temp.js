const fs = require('fs').promises;

// const data=fs.readFile("./hello.txt","utf-8",(err,data)=>{
//   console.log(data.toString())
// })


//fs.writeFile("./hello.txt", "hello asdvasdvword!");

//fs.appendFile('./hello.txt',"\nappend file.")
if(!fs.access("./hello.txt")) fs.unlink("./hello.txt");


