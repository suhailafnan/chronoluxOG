const Order = require("../models/orderModels");
const User = require("../models/UserModel");
const Wishlist = require("../models/wishList");
const Product = require("../models/products");
const Cart = require("../models/cart");
const addToWishlist = async (req, res) => {
  try {
  
    const user = req.session.user;
    const productId = req.query.productId;
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ userId: user });

    if (wishlist) {
      const productExists = wishlist.product.some(
        (item) => item.productId.toString() === productId
      );
      if (productExists) {
        return res
          .status(200)
          .send({
            success: false,
            message: "Product is already in the wishlist",
          });
      }

      wishlist.product.push({ productId: productId });
    } else {
      wishlist = new Wishlist({
        userId: user,
        product: [{ productId: productId }],
      });
    }

    await wishlist.save();

    res
      .status(200)
      .send({
        success: true,
        message: "Product added to wishlist successfully",
      });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Server error" });
  }
};

const loadWishlist = async (req, res) => {
  try {
    const userId = req.session.user;
    const userData = await User.findOne({ _id: userId });
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    const wishlistData = await Wishlist.findOne({ userId: userId }).populate(
      "product.productId"
    );

    let wishlist = [];
    if (wishlistData && wishlistData.product) {
      wishlist = wishlistData.product;
    }
    res.render("wishlist", {
      user: userData,
      wishlist: wishlist,
      count: wishlist.length,
      cartCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.session.user;
    const productId = req.query.productId;

    const removed = await Wishlist.updateOne(
      { userId: userId },
      { $pull: { product: { productId: productId } } }
    );

    if (removed.modifiedCount > 0) {
      res
        .status(200)
        .send({ success: true, message: "Removed from wishlist successfully" });
    } else {
      res
        .status(400)
        .json({
          success: false,
          message: "Failed to remove the product from the wishlist.",
        });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        success: false,
        message:
          "An error occurred while removing the product from the wishlist.",
      });
  }
};

const addToCartFromWshlist = async (req, res) => {
  try {
    const userId = req.session.user;
    const productId = req.query.ProductId;

   

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID not found in session" });
    }

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID not provided" });
    }

    const cart = await Cart.findOne({ userId: userId });
  

    if (cart) {
      const existsCartProduct = cart.product.find(
        (p) => p.productId.toString() === productId
      );

      if (existsCartProduct) {
       ;
        return res.json({ success: false, message: "already" });
      } else {
        cart.product.push({ productId, quantity: 1 });
        await cart.save();
        console.log("Product added to cart");
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
  
      return res.status(200).json({
        success: true,
        message: "Product added to cart successfully",
      });
    }
  } catch (error) {
    console.log("Error:", error.message); // Debugging statement
    res.status(500).json({ success: false, message: "Failed to add product to cart" });
  }
};


module.exports = {
  addToWishlist,
  loadWishlist,
  removeFromWishlist,
  addToCartFromWshlist 

};
