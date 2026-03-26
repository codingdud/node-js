import fs from 'fs'

//directory

fs.mkdirSync('my-folder')
fs.mkdirSync('parent/child/grandchild',{recursive:true})

const datd=fs.readdirSync('./')
console.log(datd)


fs.watch('hello.txt',(eventtype,filename)=>{
  console.log(`${filename} was ${eventtype}`)
})


fs.rmSync('my-folder',{recursive:true})
fs.rmSync('parent',{recursive:true,force:true})
