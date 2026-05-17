// buffer are tempare storage that hold raw binary data in hex. like bucket holding water before pouring water
const arr=Buffer.from(["hello",true,1,2])
console.log(Array.from(arr))
const str=Buffer.from("hello")
console.log(str.toString())
const data=Buffer.from(JSON.stringify({name:"animesh",age:24}))
console.log(data.toString())

const empty=Buffer.alloc(10);
console.log(empty.length)
for(let [i,k] of empty.entries()) {
  //console.log(i,k)
  empty[i]=65+i
}
console.log(empty)