const User = require("../models/UserModel");
const Wallet = require("../models/walletModel");
const Cart = require("../models/cart");
const Order = require("../models/orderModels");
const Address = require("../models/address");
const crypto = require("crypto");
const Products = require("../models/products");
const Coupon = require("../models/couponModel");

const generateRandomId = async () => {
  try {
    const randomId = crypto.randomBytes(8).toString("hex");
    return randomId;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate random ID");
  }
};

const loadWallet = async (req, res) => {
  try {
    const user = req.session.user;
    const wallet = await Wallet.findOne({ UserId: user });
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    res.render("userWallet", { user, wallet, cartCount });
  } catch (error) {
    console.log(error);
  }
};

const addToWallet = async (req, res) => {
  try {
    const user = req.session.user;
    const amount = parseFloat(req.query.amount);
    let wallet = await Wallet.findOne({ UserId: user._id });
    if (!wallet) {
      wallet = new Wallet({
        UserId: user._id,
        balance: amount,
        history: [
          {
            amount: amount,
            transactionType: "razorpay",
            previousBalance: 0,
          },
        ],
      });
    } else {
      const previousBalance = wallet.balance;
      wallet.balance += amount;
      wallet.history.push({
        amount: amount,
        transactionType: "razorpay",
        previousBalance: previousBalance,
      });
    }
    await wallet.save();
    res.status(200).json({ message: "Wallet updated successfully", wallet });
  } catch (error) {
    console.error("Error adding to wallet:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const withdrawMoney = async (req, res) => {
  try {
    const user = req.session.user;
    const amount = parseFloat(req.query.amount);
    const wallet = await Wallet.findOne({ UserId: user._id });
    if (!wallet) {
      return res
        .status(404)
        .json({ success: false, error: "Wallet not found" });
    }

    const previousBalance = wallet.balance;

    if (previousBalance < amount) {
      return res
        .status(400)
        .json({ success: false, error: "Insufficient balance" });
    }

    wallet.balance -= amount;
    wallet.history.push({
      // amount: -amount,
      amount: amount,
      transactionType: "withdraw",
      previousBalance: previousBalance,
    });
    await wallet.save();

    res
      .status(200)
      .json({ success: true, message: "Withdrawal successful", wallet });
  } catch (error) {
    console.error("Error withdrawing from wallet:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const viewTransaction = async (req, res) => {
  try {
    const user = req.session.user;
    const wallet = await Wallet.findOne({ UserId: user._id });
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    res.render("walletTransaction", { user, wallet, cartCount });
  } catch (error) {
    console.log(error);
  }
};

const placeOrderWithWallet = async (req, res) => {
  try {
    const { addressId, paymentMethod, totalAmount, cartDetails, couponCode } =
      req.body;
    const user = req.session.user;
    const userId = user._id;

    // ###################################Fetch the user's wallet and cart###################################
    const wallet = await Wallet.findOne({ UserId: userId });
    if (!wallet) {
      return res
        .status(404)
        .json({ success: false, message: "Wallet not found" });
    }

    const cart = await Cart.findOne({ userId }).populate("product.productId");
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // ###################################Check if the wallet has sufficient balance###################################
    if (totalAmount > wallet.balance) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance in wallet!" });
    }

    //################################### Fetch the selected address###################################
    const addressData = await Address.findOne({
      userId,
      "address._id": addressId,
    });
    if (!addressData) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    const selectedAddress = addressData.address.find(
      (addr) => addr._id.toString() === addressId
    );
    if (!selectedAddress) {
      return res
        .status(404)
        .json({ success: false, message: "Selected address not found" });
    }

    // ###################################Check for out-of-stock products###################################
    const outOfStockProducts = cart.product
      .filter((item) => item.productId.Stock < item.quantity)
      .map((item) => item.productId.name);
    if (outOfStockProducts.length > 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Products are out of stock, please remove product(s)",
          outOfStockProducts,
        });
    }

    // ############Handle first order and referral bonus###################################
    const existingOrders = await Order.findOne({ userId });
    let isFirstOrder = false;
    let referedCode = null;

    if (!existingOrders) {
      isFirstOrder = true;
      referedCode = user.referedCode;

      if (referedCode) {
        const referredUser = await User.findOne({ referenceCode: referedCode });
        if (referredUser) {
          const referredUserId = referredUser._id;
          let referredUserWallet = await Wallet.findOne({
            UserId: referredUserId,
          });
          if (!referredUserWallet) {
            referredUserWallet = new Wallet({
              UserId: referredUserId,
              balance: 50,
              history: [
                {
                  amount: 50,
                  transactionType: "Referral bonus",
                  previousBalance: 0,
                },
              ],
            });
          } else {
            referredUserWallet.balance += 50;
            referredUserWallet.history.push({
              amount: 50,
              transactionType: "Referral bonus",
              previousBalance: referredUserWallet.balance - 50,
            });
          }
          await referredUserWallet.save();

          let currentUserWallet = await Wallet.findOne({ UserId: userId });
          if (!currentUserWallet) {
            currentUserWallet = new Wallet({
              UserId: userId,
              balance: 30,
              history: [
                {
                  amount: 30,
                  transactionType: "First order bonus",
                  previousBalance: 0,
                },
              ],
            });
          } else {
            currentUserWallet.balance += 30;
            currentUserWallet.history.push({
              amount: 30,
              transactionType: "First order bonus",
              previousBalance: currentUserWallet.balance - 30,
            });
          }
          await currentUserWallet.save();
        }
      }
    }

    // ###################################Update wallet balance###################################
    const previousBalance = wallet.balance;
    wallet.balance -= totalAmount;
    wallet.history.push({
      amount: totalAmount,
      transactionType: "Ordered",
      previousBalance,
    });
    await wallet.save();

    // ###################################Process cart items###################################
    const items = [];
    for (const item of cart.product) {
      const product = await Products.findById(item.productId);
      if (!product) continue;

      items.push({
        productId: item.productId,
        quantity: item.quantity,
        categoryId: product.category,
        price: product.finalPrice,
      });

      product.Stock -= item.quantity;
      await product.save();
    }

    // ###################################Clear the cart in herre###################################
    await Cart.findOneAndUpdate({ userId }, { product: [] });

    // ###################################Create a new order###################################
    const randomId = await generateRandomId();
    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      discountAmount: req.body.discountAmount || 0,
      address: selectedAddress,
      paymentMethod,
      orderId: randomId,
      createdAt: new Date(),
    });

    await newOrder.save();

    //################################### Handle coupon code###################################
    if (couponCode) {
      const appliedCoupon = await Coupon.findOne({
        couponCode,
        is_active: true,
      });
      if (appliedCoupon) {
        await User.findByIdAndUpdate(userId, {
          $pull: { coupons: appliedCoupon._id },
        });
      }
    }

    res
      .status(200)
      .json({
        success: true,
        orderId: newOrder._id,
        message: "Order placed successfully!",
      });
  } catch (error) {
    console.error("Error placing order with wallet:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while placing the order.",
      });
  }
};

const giveCoupon = async (userId, totalAmount, orderId) => {
  try {
    console.log("inside the give coupon function");
    const user = await User.findById(userId);
    const coupons = await Coupon.find({ is_active: true });
    if (coupons) {
      cosnole.log(coupons);
    } else {
      console.log("coupons not found");
    }
    let addedCoupons = [];
    for (const coupon of coupons) {
      if (totalAmount >= coupon.minimum) {
        await User.findByIdAndUpdate(
          { _id: userId },
          { $push: { coupons: coupon._id } }
        );
        addedCoupons.push(coupon);
      }
    }

    return addedCoupons;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const walletOrderConfirmation = async (req, res) => {
  try {
    console.log("order not efrsdfgsdgdfgfdhd");
    const user = req.session.user;
    const userId = req.session.user._id;
    const orderId = req.query.orderId;
    const order = await Order.findOne({ orderId: orderId }).populate(
      "items.productId"
    );

    if (!order) {
      console.log("order not found");
      return res
        .status(404)
        .render("errorPage", { message: "Order not found" });
    } else {
      console.log(order);
    }
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    const addedCoupons = await giveCoupon(user, order.totalAmount, orderId);
    if (!addedCoupons) {
      console.log(" addedCouponsnot found");
      return res.status(404).render("errorPage", { message: " addedCoupons" });
    }
    res.render("walletOrderConfirmation", {
      user,
      order,
      addedCoupons,
      cartCount,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("errorPage", { message: "Internal Server Error" });
  }
};

module.exports = {
  loadWallet,
  addToWallet,
  withdrawMoney,
  viewTransaction,
  placeOrderWithWallet,
  giveCoupon,
  walletOrderConfirmation,
};
