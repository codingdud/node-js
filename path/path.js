// every os have there own way of handeling path in system 
// line mac/linux 'home/docment/file.txt'
// window 'home\doument\file.txt'
// to solve this problem path 

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
console.log([__dirname,__filename])

const filepath=path.join("home",'doument',"file.txt")
console.log (filepath)

const configpath=path.join(__dirname,'config')
console.log(configpath)
console.log(path.resolve("hello.txt"))

console.log(path.basename(__filename))
console.log(path.basename(__filename,'.js'))

console.log(path.extname("app.js"))
const pathparse=path.parse(__filename)
console.log(pathparse)
console.log(path.format(pathparse))
