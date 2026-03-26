import express, { urlencoded } from 'express';
import productRouter from './routers/productRouter';

const app = express();
//support for json
app.use(express.json())
//support for form data
app.use(urlencoded({extended:true}))
// router 
app.use("/api/v1/product",productRouter)

app.listen(process.env.PORT||8080,()=>{
  console.info(`listing on port:8080`)
})