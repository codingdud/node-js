const os= require('os'); //give info about os and hardware
console.log(os.platform()) // win32 linux mac
console.log(os.arch()) //x64 arm64
console.log(os.release()) // version
console.log(os.type()) // windows_nt Ubantu, Darwin

console.log((os.totalmem()/1024/1024/1024).toFixed(2)) // mem/1024 kb/1024 mb/1024 gb
console.log(os.freemem()/1024/1024/1024)

console.log(os.hostname())
console.log(os.homedir())
console.log(os.uptime()/60/60/24)
console.log(os.EOL)


console.log(os.cpus()[0])
console.log(os.cpus().length)
console.log(os.cpus().reduce((acc,x)=>acc+x.speed,0)/os.cpus().length)



