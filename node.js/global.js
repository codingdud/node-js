//console.log(globalThis)
console.log(__dirname)
console.log(__filename)
// process curent nodejs env
console.log(process.argv)
console.log(process.cwd())
console.log(process.env.PORT)
// process.exit(0)
// cli using prcoess.argv that first arg as node location second is current code and third take argument 
const arg=process.argv.slice(2);
console.log(arg)

