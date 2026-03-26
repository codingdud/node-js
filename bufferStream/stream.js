// A readStream is data flowing piece by piece, like water through a pipe.
// Type	What it Does	Example
// Readable	Read data FROM it	Reading a file
// Writable	Write data TO it	Writing to a file
// Duplex	Read AND Write	Network socket
// Transform	Modify data passing through	Compression

import fs from 'fs'
import { Transform } from 'stream';
import { callbackify } from 'util';
const readStream=fs.createReadStream("./hello.txt",{encoding:'utf-8',highWaterMark:1024}) //event data

readStream.on("data",(chunk)=>{
  console.log("Chunk:",chunk,chunk.length,"bytes");
})
readStream.on('end',()=>console.log("Done!"))

const writeStream=fs.createWriteStream("output.txt")
writeStream.write("Line 1\n")
writeStream.write("Line 1\n")
writeStream.write("Line 1\n")
writeStream.write("Line 1\n")
writeStream.write("Line 1\n")
writeStream.write("Line 1\n")
writeStream.write("Line 1\n")
writeStream.write("Line 1\n")
writeStream.end("Line 1\n")
writeStream.on('finish',()=>console.log("Writen!"))
// transfor data
const upperCase=new Transform({
  transform(chunk,encode,cb){
   
    cb(null,chunk.toString().toUpperCase())
  }
})
// pipe read write both 

const readStream1=fs.createReadStream("./hello.txt",{encoding:'utf-8',highWaterMark:1024})
const writeStream1=fs.createWriteStream("destination.txt")
readStream1.pipe(upperCase).pipe(writeStream1)
readStream1.on("end",()=>console.log("read for pipe"))
writeStream1.on("finish",()=>console.log("write complet for pipe"))



