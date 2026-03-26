import fs from 'fs'

const data=fs.readFileSync('./hello.txt','utf-8')
console.log(data)
console.log("finish file loading")

const data2=fs.readFileSync('./hello.txt','utf-8')
console.log(data2)
console.log("finish file loading")

//---------------------------------------------------------
try{
  fs.writeFileSync('temp.txt',"data to write\nnext line")
}catch{
  console.log('error')
}

fs.writeFileSync('temp.txt',"data to write\nnext line")
console.log("data wrting complet")

const students = [
    { name: 'Rahul', age: 20, grade: 'A' },
    { name: 'Priya', age: 21, grade: 'B' },
    { name: 'Amit', age: 19, grade: 'A+' }
];

fs.writeFileSync('./students.json',JSON.stringify(students))
console.log("student.json created")

fs.appendFileSync('append.txt',"text added 1\n")

fs.unlinkSync('./append.txt')
fs.unlinkSync('./temp.txt')
fs.unlinkSync('./students.json')

fs.renameSync('./old.txt','./new.txt')

/* if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data')
} */

fs.renameSync('./new.txt','./data/new.txt')