const User = require("../models/UserModel");
const Wallet = require("../models/walletModel");
const Cart = require("../models/cart");
const Order = require("../models/orderModels");
const Address = require("../models/address");
const crypto = require("crypto");
const Products = require("../models/products");
const Coupon = require("../models/couponModel");

// const loadCoupon = async (req, res) => {
//   try {
//     const user = req.session.user;
//     const populatedUser = await User.findOne({ _id: user._id }).populate(
//       "coupons"
//     );
//     let cartCount = 0;
//     if (req.session.user) {
//       const cart = await Cart.findOne({ userId: req.session.user._id });
//       if (cart && cart.product) {
//         cartCount = cart.product.length;
//       }
//     }
//     res.render("userCoupon", {
//       user: populatedUser,
//       coupons: populatedUser.coupons,
//       cartCount,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).render("errorPage", { message: "Failed to load coupons" });
//   }
// };
const loadCoupon = async (req, res) => {
  try {
    const user = req.session.user;
    const populatedUser = await User.findOne({ _id: user._id }).populate('coupons');

    let cartCount = 0;
    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
console.log(populatedUser.coupons)
    res.render("userCoupon", {
      user: populatedUser,
      coupons: populatedUser.coupons,
      cartCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).render("errorPage", { message: "Failed to load coupons" });
  }
};



module.exports = {
  loadCoupon,
};
