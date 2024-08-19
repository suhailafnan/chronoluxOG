const User = require("../models/UserModel");
const newgoogleUser = require("../models/googleUser");
const Category = require("../models/category");
const Products = require("../models/products");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const Cart = require("../models/cart");

const loadCart = async (req, res) => {
  try {
    const userId = req.session.user;
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    const cartData = await Cart.findOne({ userId })
      .populate({
        path: "product.productId",
        model: "products",
      })
      .exec();

    res.render("cart", {
      user: req.session.user,
      cartCount,
      cartData: cartData ? cartData.product : [],
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Failed to load cart" });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.session.user;
    const productId = req.query.ProductId;
   

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID not found in session" });
    }

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID not provided" });
    }

    const cart = await Cart.findOne({ userId: userId });

    if (cart) {
      const existsCartProduct = cart.product.find(
        (p) => p.productId.toString() === productId
      );

      if (existsCartProduct) {
        // return res.status(400).json({ success: false, message: "Product already in cart" });
        res.json({ success: false, message: "already" });
      } else {
        cart.product.push({ productId, quantity: 1 });
        await cart.save();
        return res.status(200).json({
          success: true,
          message: "Product added to cart successfully",
        });
      }
    } else {
      const newCart = new Cart({
        userId: userId,
        product: [{ productId: productId, quantity: 1 }],
      });
      await newCart.save();
      return res
        .status(200)
        .json({ success: true, message: "Product added to cart successfully" });
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to add product to cart" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.session.user;
    const productId = req.query.ProductId;

    if (
      await Cart.updateOne(
        { userId },
        { $pull: { product: { productId: productId } } }
      )
    ) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to remove the product from the cart.",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const updateQuantity = async (req, res) => {
  const userId = req.session.user;
  const { productId, quantity } = req.body;

  try {
    const products = await Products.findById({ _id: productId });

    if (!products) {
      return res.status(404).json({ error: "Product not found" });
    }

    await Cart.findOneAndUpdate(
      { userId: userId, "product.productId": productId },
      { $set: { "product.$.quantity": quantity } },
      { new: true }
    );

    res
      .status(200)
      .json({ success: true, message: "Cart quantity updated successfully" });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const checkQuantity = async (req, res) => {
  try {
    const userId = req.session.user;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not logged in" });
    }
    const cart = await Cart.findOne({ userId }).populate("product.productId");
    let outOfStockProducts = [];

    if (cart) {
      for (let item of cart.product) {
        const product = item.productId;

        if (product.Stock < item.quantity) {
          outOfStockProducts.push(product.name);
        }
      }

      const cartProduct = cart.product;

      if (cartProduct.length <= 0) {
        res
          .status(400)
          .json({ success: false, message: "No products in cart" });
      } else if (outOfStockProducts.length > 0) {
        res.status(400).json({
          success: false,
          message: "Products is out of Stock, please remove product",
        });
      } else {
        res.json({ success: true });
      }
    } else {
      res.status(404).json({ success: false, message: "Cart not found" });
    }
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  loadCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  checkQuantity,
};
