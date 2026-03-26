// manul cotrol of context insted automated contole (asyncLocalstorage)
// for costom async operation eg: database connection, worker pools, event emitters
// Core idea: When you create an AsyncResource, 
// it captures the current async context at that moment. 
// Later, you can re-enter that context using .runInAsyncScope().

import {AsyncResource} from 'async_hooks';

class DBQuery extends AsyncResource{
  constructor(db){
    super("DBquery") //give resource name
    this.db=db;
  }
  getInfo(querry,cb){
    this.db.get(querry,()=>{
      // withut this cb lose it contxt
      console.log(err)
      console.log(data)
      this.runInAsyncScope(cb,null,err,data) //context restore
    })
  }
}

function cb(q){
  console.log(q);
}
const db={
  get(query,cb){
    cb(query);
  }
}

const dbobj=new DBQuery(db);
dbobj.getInfo("query",cb);

class WorkerPooltaskInfo extends AsyncResource{
  constructor(cb){
    super('workerpooltask');
    this.cb=cb; //capture caller context at task creation time
  }
  done(err,res){
    this.runInAsyncScope(this.cb,null,err,result);
    this.emitDestroy() //clean up call once only!
  }
}

