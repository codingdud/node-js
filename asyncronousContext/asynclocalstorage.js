// problem  lose context when there mutiple request
// lead to confution
//const {AsyncLocalStorage}=require('async_hooks');
import {AsyncLocalStorage} from 'async_hooks';
// every settimeout promise await inside a  `run()` can access same safe

const storage=new AsyncLocalStorage();
// (state,callback) context bubble callback fn has 
// access to that state no one else have outside the functin 
const user={userid:1213,name:'Animesh'}
storage.run(user,()=>{
  setTimeout(()=>{
    user.name="aniket"
    console.log(storage.getStore()) // {userid:1213,name:'Animesh'}
  },6000)
})

storage.run(user,()=>{
  setTimeout(()=>{
    console.log(storage.getStore()) // {userid:1213,name:'Animesh'}
  },1000)
}) 
// undefine out side 
console.log(storage.getStore()) // undefine

// .getStore read current context
// enterWith(state) //permanet set context

storage.enterWith(user);
console.log(storage.getStore())

// temporary escap context storage.exit(callback)

storage.exit(()=>{
  console.log(storage.getStore())
})


const storeage2=new AsyncLocalStorage();
const obj1={name:"Animesh"}
const Capture=storeage2.run(obj1,()=>{
  obj1.name="akanoob";
  return AsyncLocalStorage.snapshot();
})
const obj2={name:"bob"};

storeage2.run(obj2,()=>{
  console.log("outside capture")
  console.log(storeage2.getStore())
  Capture(()=>{
    console.log("inside capture")
    console.log(storeage2.getStore())
  })
})


const storage3=AsyncLocalStorage();
let bondfn;
storage.run({color:'brown'},()=>{
  bondfn=AsyncLocalStorage.bind(()=>{
    console.log(storage3.getStore())
  })
})



const { AsyncResource, AsyncLocalStorage } = require('node:async_hooks');
const { EventEmitter } = require('node:events');

const emitter = new EventEmitter();
const asyncLocalStorage=new AsyncLocalStorage()
asyncLocalStorage.run({ requestId: 'ABC' }, () => {
  // ✅ Bind to current context
  emitter.on('data', AsyncResource.bind((data) => {
    console.log(asyncLocalStorage.getStore()); // { requestId: 'ABC' }
  }));
});

// Emit from different context
asyncLocalStorage.run({ requestId: 'XYZ' }, () => {
  emitter.emit('data', { value: 42 });
  // Handler still has access to 'ABC' context!
});
