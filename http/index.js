const https=require('https')
const fs=require('fs')

const option={
  key: fs.readFileSync('./cert/private-key.pem'),
  cert:fs.readFileSync('./cert/certificate.pem')
}

const server=https.createServer(option,(req,res)=>{
  const log=`${Date.now()} [${req.headers.host}]:${req.url}\n`
  fs.appendFile('log.txt',log,(err)=>{
    switch(req.url){
      case "/":
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync('index.html'))
        break;
      case "/about":
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync('index.html'))
        break;
      default:
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found')
    }
  })
})

server.listen(403, () => {
  console.log('HTTPS server running at https://localhost:403');
});


// {"Content-Type:text/plane"}
// {"Content-Type:text/html"}
// {"Content-Type:application/json"}
// {"barer Tokken"}
// {}