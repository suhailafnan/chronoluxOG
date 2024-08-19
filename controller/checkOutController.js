const User = require("../models/UserModel");
const newgoogleUser = require("../models/googleUser");
const Category = require("../models/category");
const Products = require("../models/products");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const Cart = require("../models/cart");
const Address = require("../models/address");
const Order = require("../models/orderModels");
const crypto = require("crypto");
const Wallet = require("../models/walletModel");
const Coupon = require("../models/couponModel");

const loadcheckOutPage = async (req, res) => {
  try {
    const user = req.session.user;
    const addressdata = await Address.findOne({ userId: user });
    const cartdata = await Cart.findOne({ userId: user }).populate(
      "product.productId"
    );
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    let totalamount = 0;
    cartdata.product.forEach((item) => {
      const { productId, quantity } = item;
      if (productId && productId.finalPrice) {
        const subtotal = productId.finalPrice * quantity;
        totalamount += subtotal;
      }
    });

    res.render("checkOut", {
      addressdata,
      totalamount,
      user,
      cartdata,
      cartCount,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const generateRandomId = () => {
  const digits = "0123456789";
  let randomId = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    randomId += digits[randomIndex];
  }
  return randomId;
};


//     try {

//         const couponCode=req.query.couponCode
//         console.log('Coupon code received:', couponCode);

//         const userId = req.session.user._id;
//         const coupon = await Coupon.findOne({ couponCode: couponCode, is_active: true });
//         console.log('Coupon found:', coupon);

//         if (!coupon) {
//             return res.status(400).json({ success: false, message: 'Invalid or expired coupon code.' });
//         }

//         // Fetch the user's cart details
//         const cart = await Cart.findOne({ userId }).populate('product.productId');

//         let totalAmount = 0;
//         cart.product.forEach((item) => {
//             const { productId, quantity } = item;
//             if (productId && productId.finalPrice) {
//                 const subtotal = productId.finalPrice * quantity;
//                 totalAmount += subtotal;
//             }
//         });

//         // Calculate the discount
//         const discountAmount = (totalAmount * coupon.discount) / 100;
//         const newTotalAmount = totalAmount - discountAmount;

//         res.json({
//             success: true,
//             discountAmount,
//             discountPercentage: coupon.discount,
//             newTotalAmount
//         });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// };

// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
const applyCoupon = async (req, res) => {
  try {
    const couponCode = req.query.couponCode;
    const userId = req.session.user._id;
    const coupon = await Coupon.findOne({
      couponCode: couponCode,
      is_active: true,
    });

    if (!coupon) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired coupon code." });
    }

    // Fetch the user's cart details
    const cart = await Cart.findOne({ userId }).populate("product.productId");

    let totalAmount = 0;
    cart.product.forEach((item) => {
      const { productId, quantity } = item;
      if (productId && productId.finalPrice) {
        const subtotal = productId.finalPrice * quantity;
        totalAmount += subtotal;
      }
    });

    // Calculate the discount
    const discountAmount = (totalAmount * coupon.discount) / 100;
    const newTotalAmount = totalAmount - discountAmount;

    res.json({
      success: true,
      discountAmount,
      discountPercentage: coupon.discount,
      newTotalAmount,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
const paymentFailed = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const {
      paymentMethod,
      addressId,
      totalAmount,
      discountAmount,
      couponCode,
    } = req.body;

    // Fetch address
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

    // Fetch cart
    const cart = await Cart.findOne({ userId }).populate("product.productId");
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Check stock
    let outOfStockProducts = [];
    for (const item of cart.product) {
      const product = item.productId;
      if (product.Stock < item.quantity) {
        outOfStockProducts.push(product.name);
      }
    }

    if (outOfStockProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Products are out of stock, please remove products",
        outOfStockProducts,
      });
    }

    // Prepare order items
    const items = [];
    for (const item of cart.product) {
      const oneProduct = await Products.findById(item.productId);
      if (!oneProduct) {
        continue;
      }

      const itemDetails = {
        productId: item.productId,
        quantity: item.quantity,
        categoryId: oneProduct.category,
        price: oneProduct.finalPrice,
      };

      items.push(itemDetails);

      // Update product stock and order count
      oneProduct.Stock -= item.quantity;
      oneProduct.orderCount += item.quantity;
      await oneProduct.save();

      // Update category order count
      const category = await Category.findById(oneProduct.category);
      if (category) {
        category.orderCount += item.quantity;
        await category.save();
      }
    }

    // Clear cart
    await Cart.findOneAndUpdate({ userId }, { product: [] });

    // Generate random order ID
    const randomId = await generateRandomId();

    // Create order with "payment failed" status
    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      discountAmount,
      address: selectedAddress,
      paymentMethod: "payment failed", // Payment method as failed
      orderStatus: "payment failed", // Order status as failed
      orderId: randomId,
      createdAt: new Date(),
    });

    // Apply delivery charge if necessary
    if (totalAmount <= 2500) {
      newOrder.deliveryCharge = 40;
    }

    // Save the order
    await newOrder.save();

    // Handle coupon application
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

    res.status(200).json({ success: true, orderId: newOrder._id });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const rePaymentSuccess = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { amount, orderId } = req.query;

    const order = await Order.findOne({ orderId: orderId });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.paymentMethod = "online";
    order.orderStatus = "Approved";
    order.totalAmount = amount;

    await order.save();

    res.status(200).json({ success: true, orderId: order._id });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const addToPlaceOrder = async (req, res) => {
  try {
    const user = req.session.user;
    const orderData = req.body;
    const paymentMethod = orderData.paymentMethod;
    const addressId = orderData.addressId;
    const userId = req.session.user._id;
    const totalAmount = orderData.totalAmount;
    const discountAmount = orderData.discountAmount;
    const appliedCouponCode = orderData.couponCode;
    const deliveryCharge = 40;
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

    const cart = await Cart.findOne({ userId }).populate("product.productId");
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    let outOfStockProducts = [];
    for (const item of cart.product) {
      const product = item.productId;
      if (product.Stock < item.quantity) {
        outOfStockProducts.push(product.name);
      }
    }

    if (outOfStockProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Products are out of stock, please remove products",
        outOfStockProducts,
      });
    }

    const existingOrders = await Order.findOne({ userId });
    let isFirstOrder = false;
    let referedCode = null;

    if (!existingOrders) {
      isFirstOrder = true;
      referedCode = user.referedCode;
      if (referedCode) {
        const referedUser = await User.findOne({ referenceCode: referedCode });
        if (referedUser) {
          const referedUserId = referedUser._id;
          let referedUserWallet = await Wallet.findOne({
            UserId: referedUserId,
          });
          if (!referedUserWallet) {
            referedUserWallet = new Wallet({
              UserId: referedUserId,
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
            referedUserWallet.balance += 50;
            referedUserWallet.history.push({
              amount: 50,
              transactionType: "Referral bonus",
              previousBalance: referedUserWallet.balance - 50,
            });
          }
          await referedUserWallet.save();

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

    const items = [];
    for (const item of cart.product) {
      const oneProduct = await Products.findById(item.productId);

      if (!oneProduct) {
        continue;
      }

      const itemDetails = {
        productId: item.productId,
        quantity: item.quantity,
        // categoryId: oneProduct.category,
        price: oneProduct.finalPrice,
      };

      items.push(itemDetails);

      oneProduct.Stock -= item.quantity;
      oneProduct.orderCount += item.quantity;
      await oneProduct.save();

      const category = await Category.findById(oneProduct.category);
      if (category) {
        category.orderCount += item.quantity;
        await category.save();
      }
    }

    await Cart.findOneAndUpdate({ userId }, { product: [] });

    const randomId = await generateRandomId();
    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      discountAmount,
      address: selectedAddress,
      paymentMethod,
      orderId: randomId,
      createdAt: new Date(),
    });

    if (totalAmount <= 2500) {
      newOrder.deliveryCharge = 40;
    }

    await newOrder.save();

    if (appliedCouponCode) {
      const appliedCoupon = await Coupon.findOne({
        couponCode: appliedCouponCode,
        is_active: true,
      });
      if (appliedCoupon) {
        await User.findByIdAndUpdate(userId, {
          $pull: { coupons: appliedCoupon._id },
        });
      }
    }

    res.status(200).json({ success: true, orderId: newOrder._id });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ########this will  check that is that coupon given or not but the hting in the up will check like that
const giveCoupon = async (userId, totalAmount, orderId) => {
  try {
    const user = await User.findById(userId);
    const coupons = await Coupon.find({ is_active: true });

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

const orderConfirmation = async (req, res) => {
  try {
    const user = req.session.user;
    const userId = req.session.user._id;
    const orderId = req.query.orderId;
    const order = await Order.findById(orderId).populate("items.productId");

    if (!order) {
      return res
        .status(404)
        .render("errorPage", { message: "Order not found" });
    }
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    const addedCoupons = await giveCoupon(userId, order.totalAmount, orderId);
    res.render("orderConfirmation", { user, order, addedCoupons ,cartCount});
  } catch (error) {
    console.log(error.message);
    res.status(500).render("errorPage", { message: "Internal Server Error" });
  }
};
const walletOrderConfirmation = async (req, res) => {
  try {
    const user = req.session.user;
    const userId = req.session.user._id;
    const orderId = req.query.orderId;
    const order = await Order.findById(orderId).populate("items.productId");
    const deliveryCharge = 40;
    if (!order) {
      return res
        .status(404)
        .render("errorPage", { message: "Order not found" });
    }
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }

    const addedCoupons = await giveCoupon(userId, order.totalAmount, orderId);
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

      if (!product) {
        continue;
      }

      const itemDetails = {
        productId: item.productId,
        quantity: item.quantity,
        categoryId: product.category,
        price: product.finalPrice,
      };

      items.push(itemDetails);

      product.Stock -= item.quantity;
      product.orderCount += item.quantity;
      await product.save();

      const category = await Category.findById(product.category);
      if (category) {
        category.orderCount += item.quantity;
        await category.save();
      }
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

    if (totalAmount <= 2500) {
      newOrder.deliveryCharge = 40;
    }
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

module.exports = {
  loadcheckOutPage,
  addToPlaceOrder,
  orderConfirmation,
  generateRandomId,
  giveCoupon,
  applyCoupon,
  walletOrderConfirmation,
  placeOrderWithWallet,
  paymentFailed,
  rePaymentSuccess,
};
