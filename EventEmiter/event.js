import { error, log } from 'console';
import {errorMonitor, EventEmitter} from 'events'
// event with emiter emit the event and listner
const eventobj=new EventEmitter();
eventobj.setMaxListeners(20)
eventobj.on('event',(data)=>{
  console.log("event listen has recive data:",data)
})
eventobj.emit('event','data-object array etc')


const obj={
  newevent:new EventEmitter(),
  name:"ankit",
  EventEmiter(){
    this.newevent.emit('event1','somedata')
  },
  SomeFuntion(){
   const temp=()=>{
    this.newevent.on('event1',(data)=>{
      console.log("called listner without this",this.name)
      console.log(data);
    })}
    temp();
  }
}
obj.SomeFuntion()
//const tempfn=obj.SomeFuntion
//tempfn();
obj.EventEmiter()

eventobj.once('event',(data)=>{
  console.log("once:",data);
})

eventobj.emit('event',"second time")
eventobj.emit('event',"thirt time")

//Listeners are called synchronously (one after another, in order).
eventobj.on('event3',()=>console.log('first'))
eventobj.on('event3',()=>console.log('second'))
eventobj.on('event3',()=>console.log('third'))
//eventobj.removeAllListeners(['event3'])
console.log("start")
eventobj.emit('event3')
console.log("end")


eventobj.on('error',(data)=>{
  console.log(data.message)
})
eventobj.on(errorMonitor,(err)=>{
  console.log('Error detected:', err.message);
})
eventobj.emit('error',new Error("some thing went wrong!"))


//inspection 
console.log(eventobj.listeners('event3'))
console.log(eventobj.rawListeners('evnt3'))
console.log('\nCorrect way to inspect listeners:')
console.log('Direct log:', eventobj.listeners('event'))
console.log('Listener count:', eventobj.listenerCount('event3'))
console.log('Event names:', eventobj.eventNames())


