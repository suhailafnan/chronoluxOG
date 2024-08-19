const mongoose=require("mongoose");
require('dotenv').config();
;
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_USER;
   
    await mongoose.connect(process.env.MONGODB_USER);
    console.log("DB is connected");
  } catch (error) {
    console.error("Error connecting to DB:", error.message);
  }
};
connectDB()
console.log('MONGODB_USER:', process.env.MONGODB_USER);

require("dotenv").config();
const express=require("express");
const app=express();
const path=require('path')
const userRoute = require('./routes/userRoute');

 //const adminRoute = require('./routes/adminRoute');
const session = require('express-session');
const adminRoute=require('./routes/adminRoute')
const flash = require('express-flash');

app.use(session({
    secret: process.env.SESSION_SECRET ,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: false } // set to true if using HTTPS
}));
app.use(express.urlencoded({ extended: true }));

app.use(flash());

app.use(express.static(path.join(__dirname,"public")));

app.use('/',userRoute);

//for admin route



app.use('/admin',adminRoute);


app.listen(8000,()=>{
    console.log("server is running on http://localhost:8000  http://localhost:8000/admin")

})