const mongoose=require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/Ecommerce")
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