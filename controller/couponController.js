const User = require("../models/UserModel");
const Wallet = require("../models/walletModel");
const Cart = require("../models/cart");
const Order = require("../models/orderModels");
const Address = require("../models/address");
const crypto = require("crypto");
const Products = require("../models/products");
const Coupon = require("../models/couponModel");

const loadAdminCouponPage = async (req, res) => {
  try {
    const perPage = 4;
    const page = req.query.page || 1;

    const totalCoupons = await Coupon.countDocuments();
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 }) // Ensures the latest coupon appears first
      .skip(perPage * page - perPage)
      .limit(perPage);

    res.render("couponList", {
      coupons,
      current: page,
      pages: Math.ceil(totalCoupons / perPage),
      adminId: req.session.user_id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const generateRandomCouponCode = () => {
  try {
    const length = 6;
    const possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let couponCode = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, possibleCharacters.length);
      couponCode += possibleCharacters.charAt(randomIndex);
    }

    return couponCode;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate random coupon code");
  }
};

const addCoupon = async (req, res) => {
  const { couponName, minimum, description, expiry, discount } = req.body;

  const RandomCouponCode = await generateRandomCouponCode();
  try {
    const newCoupon = new Coupon({
      couponCode: RandomCouponCode,
      couponName,
      minimum,
      description,
      expiry,
      discount,
      is_active: true,
    });
    await newCoupon.save();
    res.redirect("/admin/adminCouponPage");
  } catch (error) {
    console.error("Error adding coupon:", error);
    res.status(500).send("Error adding coupon");
  }
};




const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.query.couponId;
    console.log(couponId);
    await Coupon.deleteOne({ _id: couponId });
    res.json({ success: true, message: "coupon deleted successfully." });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "Failed to delete the coupon." });
  }
};

const loadEditCouponPage = async (req, res) => {
  try {
    const couponId = req.query.couponId;
    const coupon = await Coupon.findById(couponId);

    res.render("editCouponPage", { coupon, adminId: req.session.user_id });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: "Failed to load the couponEdit page.",
    });
  }
};

const editCouponPage = async (req, res) => {
  try {
    const {
      couponId,
      couponName,
      minimum,
      description,
      expiry,
      discount,
      status,
    } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      {
        couponName,
        minimum,
        description,
        expiry: new Date(expiry),
        discount,
        is_active: status === "true",
      },
      { new: true }
    );

    if (coupon) {
      res.redirect("/admin/adminCouponPage");
    } else {
      res.json({ success: false, message: "Coupon not found." });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "Failed to update the coupon." });
  }
};

module.exports = {
  loadAdminCouponPage,
  addCoupon,
  generateRandomCouponCode,
  deleteCoupon,
  loadEditCouponPage,
  editCouponPage,
};
