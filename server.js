const express = require('express')
const { connectDB } = require('./config/db')
const { userRouter } = require('./routes/userRouter')
const cors = require('cors')

const app = express()
connectDB()
.then(()=>console.log('database connected'))
.catch((error)=>console.log(error))

app.use(cors())
app.use(express.json())
 
app.use(express.urlencoded({ extended: true })); 

 
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

 

app.use('/api/users',userRouter)
app.use('/api',(req,res)=>{
  res.send('badhiya')
})
 

app.listen(4000, ()=>{
    console.log('app listening on port 4000')
}) 