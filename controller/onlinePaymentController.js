const User = require("../models/UserModel");
const Category = require("../models/category");
const Products = require("../models/products");
const Cart = require("../models/cart");
const productOffer = require("../models/offerModel");
const cateroryOffer = require("../models/categoryOffer");
const Razorpay = require("razorpay");
const Order = require("../models/orderModels");
require("dotenv").config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_IDKEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const openRazorpay = async (req, res) => {
  try {
    const users = await User.findOne({ _id: req.session.user });
    const amount = req.body.totalAmountInPaise;

    const options = {
      amount: amount,
      currency: "INR",
      receipt: "suhailafnan00@gmail.com",
    };

    instance.orders.create(options, (err, order) => {
      if (!err) {
        res.send({
          succes: true,
          msg: "ORDER created",
          // orderid: order.id,
          amount: amount,
          key_id: process.env.RAZORPAY_IDKEY,
          name: users.name,
          email: users.email,
        });
      } else {
        console.error("Error creating order:", err);
        res.status(500).send({ success: false, msg: "Failed to create order" });
      }
    });
  } catch (error) {
    console.log("error from razopay :", error.message);
  }
};

const openRazorpayWallet = async (req, res) => {
  try {
    const users = await User.findOne({ _id: req.session.user });
    const amount = req.body.totalAmountInPaise;

    const options = {
      amount: amount,
      currency: "INR",
      receipt: "suhailafnan00@gmail.com",
    };

    instance.orders.create(options, (err, order) => {
      if (!err) {
        res.send({
          success: true,
          msg: "Amount added to the wallet",
          amount: amount,
          key_id: process.env.RAZORPAY_IDKEY,
          name: users.name,
          email: users.email,
        });
      } else {
        console.error("Error adding to the wallet:", err);
        res
          .status(500)
          .send({ success: false, msg: "Failed to add to the wallet" });
      }
    });
  } catch (error) {
    console.log("Error from Razorpay:", error.message);
    res.status(500).send({ success: false, msg: "Internal server error" });
  }
};

const openRePaymentRazorpay = async (req, res) => {
  try {
    const users = await User.findOne({ _id: req.session.user });
    const amount = req.body.totalAmountInPaise;
    const orderId = req.body.orderId;
    const options = {
      amount: amount,
      currency: "INR",
      receipt: "suhailafnan00@gmail.com",
    };

    instance.orders.create(options, (err, order) => {
      if (!err) {
        res.send({
          success: true,
          msg: "Amount added to the wallet",
          amount: amount,
          key_id: process.env.RAZORPAY_IDKEY,
          name: users.name,
          email: users.email,
          orderId: orderId,
        });
      } else {
        console.error("Error when rePayment :", err);
        res.status(500).send({ success: false, msg: "Error when rePayment" });
      }
    });
  } catch (error) {
    console.log("Error from Razorpay:", error.message);
    res.status(500).send({ success: false, msg: "Internal server error" });
  }
};

module.exports = {
  openRazorpay,
  openRazorpayWallet,
  openRePaymentRazorpay,
};
