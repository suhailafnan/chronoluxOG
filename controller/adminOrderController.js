const mongoose = require("mongoose");
const Order = require("../models/orderModels");
const User = require("../models/UserModel");
const Category = require("../models/category");
const Products = require("../models/products");

const loadorderDetails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();
    const orders = await Order.find()
      .skip(skip)
      .limit(limit)
      .populate("userId")
      .populate("items.productId")
      .exec();
    const totalPages = Math.ceil(totalOrders / limit);

    res.render("orderPage", {
      orders: orders,
      currentPage: page,
      totalPages: totalPages,
      adminId: req.session.user_id,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadorderViewPage = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const order = await Order.findOne({ orderId: orderId })
      .populate("userId")
      .populate("items.productId");

    res.render("adminOrderDetailpage", { order, adminId: req.session.user_id });
  } catch (error) {
    console.log(error.message);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;
    const order = await Order.findOneAndUpdate(
      { orderId: orderId },
      { $set: { orderStatus: orderStatus } },
      { new: true }
    );
    if (order) {
      console.log("Order status updated");
      res
        .status(200)
        .send({
          success: true,
          message: "Order status updated successfully",
          order,
        });
    } else {
      res.status(404).send({ success: false, message: "Order not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadorderDetails,
  loadorderViewPage,
  updateOrderStatus,
};
