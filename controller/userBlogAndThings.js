const mongoose = require("mongoose");
const Cart = require("../models/cart");

const loadAbout = async (req, res) => {
  let cartCount = 0;

  if (req.session.user) {
    const cart = await Cart.findOne({ userId: req.session.user._id });
    if (cart && cart.product) {
      cartCount = cart.product.length;
    }
  }
  const user = req.session.user;
  res.render("about", { user, cartCount });
};

const loadBlogDetails = async (req, res) => {
  const user = req.session.user;
  let cartCount = 0;

  if (req.session.user) {
    const cart = await Cart.findOne({ userId: req.session.user._id });
    if (cart && cart.product) {
      cartCount = cart.product.length;
    }
  }
  res.render("blogDetails", { user, cartCount });
};

const loadContact = async (req, res) => {
  const user = req.session.user;
  let cartCount = 0;

  if (req.session.user) {
    const cart = await Cart.findOne({ userId: req.session.user._id });
    if (cart && cart.product) {
      cartCount = cart.product.length;
    }
  }
  res.render("contact", { user, cartCount });
};

module.exports = {
  loadAbout,
  loadBlogDetails,
  loadContact,
};
