import http from 'http'
import {AsyncLocalStorage} from 'node:async_hooks'


const storage=new AsyncLocalStorage();

function logwithid(msg){
  const id=storage.getStore();
  console.log(`[${id}] ${msg}`);
}

let idseq=0;

http.createServer((req,res)=>{
  console.log('URL:', req.url, 'Method:', req.method);
  storage.run(idseq++,()=>{
    logwithid("start");
    setTimeout(()=>{
      logwithid("finish")
      res.end()
    })
  })
}).listen(8080)