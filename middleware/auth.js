
const mongoose = require("mongoose");
const User = require("../models/UserModel");
const isLogout = async (req, res, next) => {
  try {
      if (req.session.user) {
       
          return res.redirect("/home");
      }
      next();
  } catch (error) {
      console.log(error.message);
      next(error);
  }
};

const isLogin = async (req, res, next) => {
  try {
      if (!req.session.user) {
       
          return res.redirect("/");
      }
      next();
  } catch (error) {
      console.log(error.message);
      next(error);
  }
};
const isUnblocked  = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (user && user.is_blocked) {
  
      return res.redirect("/blocked");
    }
    next();
  } catch (error) {
    console.log(error.message);
    next(error); 
  }
};

const isBlocked= async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (user && !user.is_blocked) {
      return next();
    }  
    res.redirect("/blocked");
  } catch (error) {
    console.log(error.message);
    next(error); 
  }
};
module.exports = {
  isLogin,
  isLogout,
  isBlocked ,
  isUnblocked
  

};