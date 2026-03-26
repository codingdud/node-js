express.js is framewark for creating http server
it build upon node.js http module that make create backend easier

```js
// creating express server
import express from 'express'
const app=express();
app.use()// [midleware,corse,json,content type,]
app.get() // no body
app.post() //body
app.patch() //body
app.put() //body
app.delte() // body

```

// request 
```js
app.use("api/v1/path",(req,res)=>{ // request from client | my respones
  res.send("my text") // html/text
  res.json({name:"Animesh",age:24}) //json
  res.status(201).json({message:"fail"})
})

app.listen(300,()=>{
  console.log("listing on port : 3000")
})
```


parsing request body

```js
app.use(express.json()) //add support for json
app.use(express.urlencoded({extended:true})) //parse for form data
// no json no body
```


// router in express 
- use for writing clean curud api defination
- we can divide diffrent group or realted api in seperatee files

```js
// deside what happen when perticular url is hit
app.get("api/v1/prosuct/:id/catagories/:cata/const/:const",(req,res)=>{
  const pramObj=req.prams;
})
// search prams
app.get("api/v1/prosuct/?q=javascript+interview=coding+qestion&key=2",(req,res)=>{
  const queryObj=req.query;
})
```

// router for seperating similar api in seperate file
```js
const router=express.Router()
router.get('/')
router.post('/:id')
router.delete("/:id")
export default router


app.use("api/v1/prouct",router)
```
// router chainnig
```js
const router=express.Router()
router.route('/')
.get()
.post()
.delete()

router.route('/:id')
.get()
.post()
.delete()
export default router
```
// middleware - follow oder while exuting step-1 step-2 ....

requet middle_ware[ raillimit, json, form/data, authentication]-> finaly controller

each check point is middleware - like they can inttercept req/res
 - modifie rq,res
 - end request send, json , error ,reject
 - call next() to pass (req,res) to next middleware

## type of middleware
1. application |  logger
 app.use((req,res,next)=>{
  console.log(req.url)
  next()
 })

2. route-specific authentication , 
app.get("api/v1/productsale",adminonly,()=>{})

3. Router level
router.use((req,res,next)=>{next()})

4. buildin middleware
express.json()
express.urlencoded({extended:true})

5. third -party
app.use(cors())
app.use(morgan())
app.use(helmet())
app.use(ratet())


# req and res

req.params - for router params for extrating data from url
req.query - query parameter to get query data from like q,&,+
req.body - data send by client
req.header - contain important inforamtion like token(bearer token__) and content-type(json, plane ,html)
req.url - full path with query and params
req.path - only path to perticular api request
req.method - method like GET POST PATCH DELETE PUT
req.ip - ip of client
req.hostname hostname like domain or set hostname on clinet

// send respones
res.send() - use plane and html request
res.json() - use for json data
res.status().json() -status with json data(key,value)

res.sendStatus() only status
res.redirect() - redirecto to another resource eg: res.redirect(301,"/api/v1/oldblog") //temp
res.download() - use for client to download file
res.sendFile() - send File to clinet
res.coockie() -set coockie and life time


// static file like web asserts image ,html,css & file that dont chage
app.use(express.static(path.join(__dirname,'public')))
app.use(express.static("upload"))
app.use(express.static("asserts"))
```js
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/users', (req, res) => {
    res.json([{ id: 1, name: 'Rahul' }, { id: 2, name: 'Priya' }]);
});

// Fallback for single-page apps (React)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000);
```
// template engine email, html , server side (html with embeded js)
npm i ejs
app.set('view engine','ejs')
app.set(views,path.join(__dirname,'views'))
app.listeen(3000)

app.js
views
  index.ejs
  mail.ejs
  letter.ejs
  pdf.ejs
  resume.ejs

```html
<!DOCTYPE html>
<html>
<head><title><%= title %></title></head>
<body>
    <h1>Welcome, <%= username %>!</h1>
    <p>Today is <%= new Date().toDateString() %></p>
</body>
</html>
```
```js
app.get('/', (req, res) => {
    res.render('home', { title: 'Home Page', username: 'NCR' });
});
```
```html
<% if (user.role === 'admin') { %>
    <div class="admin-panel">
        <h2>Admin Panel</h2>
        <p>Welcome Admin <%= user.name %>!</p>
    </div>
<% } else { %>
    <div class="user-panel">
        <h2>User Dashboard</h2>
        <p>Welcome <%= user.name %>!</p>
    </div>
<% } %>
```
```html
<h1>All Users (<%= users.length %>)</h1>

<% if (users.length === 0) { %>
    <p>No users found.</p>
<% } else { %>
    <table>
        <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th></tr>
        </thead>
        <tbody>
            <% users.forEach(user => { %>
                <tr>
                    <td><%= user.id %></td>
                    <td><%= user.name %></td>
                    <td><%= user.email %></td>
                </tr>
            <% }) %>
        </tbody>
    </table>
<% } %>
```
```js
app.get('/users', (req, res) => {
    const users = [
        { id: 1, name: 'Rahul', email: 'rahul@gmail.com' },
        { id: 2, name: 'Priya', email: 'priya@gmail.com' },
    ];
    res.render('users', { users });
});
```
