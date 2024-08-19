const User = require("../models/UserModel");
const newgoogleUser = require("../models/googleUser");
const Category = require("../models/category");
const Products = require("../models/products");
const Address = require("../models/address");
const bcrypt = require("bcrypt");
const Order = require("../models/orderModels");
const Cart = require("../models/cart");

const flash = require("express-flash");

const loadUserProfile = async (req, res) => {
  try {
    const user_id = req.query.id; // Retrieve user_id from query parameters
    const user = await User.findById(user_id);
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    if (user) {
      const errormsg = req.flash("errormsg");
      const successmsg = req.flash("successmsg");
      res.render("userProfile", { user, errormsg, successmsg, cartCount });
    } else {
      console.log("User not found");
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const loadEditProfile = async (req, res) => {
  try {
    const id = req.query.id;

    const userData = await User.findById(id);
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    if (userData) {
      const errormsg = req.flash("errormsg");
      const successmsg = req.flash("successmsg");
      res.render("editProfile", {
        user: userData,
        errormsg,
        successmsg,
        cartCount,
      });
    } else {
      console.log("user not found");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { user_id, name } = req.body;

    // Correct the usage of findByIdAndUpdate
    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { $set: { name: name } },
      { new: true } // Option to return the updated document
    );

    if (updatedUser) {
      req.flash("successmsg", "Name changed successfully");
      // Redirect to the user profile page with the user_id as a query parameter
      res.redirect(`/userProfile?id=${user_id}`);
    } else {
      req.flash("errormsg", "Name changing failed");
      console.log("User not found");
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const changePasswordLoad = async (req, res) => {
  try {
    const user_id = req.query.id; // Retrieve user_id from query parameters
    const userData = await User.findById(user_id);
    if (!userData) {
      req.flash("errormsg", "User not found");
      return res.redirect("/someErrorPage"); // Redirect if user not found, or handle accordingly
    }
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    const errormsg = req.flash("errormsg");
    const successmsg = req.flash("successmsg");
    res.render("changePassword", {
      user: userData,
      errormsg,
      successmsg,
      cartCount,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

// securding the password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const changepassword = async (req, res) => {
  try {
    const { user_id, oldPassword, newPassword, confirmPassword } = req.body;
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    // Fetch the user from the database
    const user = await User.findById(user_id);
    if (!user) {
      req.flash("errormsg", "User not found");
      return res.redirect(`/ChangePassword?id=${user_id}`);
    }

    // Compare oldPassword with the hashed password stored in the database
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      req.flash("errormsg", "Old password is incorrect");
      return res.redirect(`/ChangePassword?id=${user_id}`);
    }

    // Validate the new password and confirmation
    if (newPassword !== confirmPassword) {
      req.flash("errormsg", "New password and confirm password do not match");
      return res.redirect(`/ChangePassword?id=${user_id}`);
    }

    if (!passwordRegex.test(confirmPassword)) {
      req.flash(
        "errormsg",
        "Password must be at least 6 characters long, contain one uppercase letter, one number, and one special character."
      );
      return res.redirect(`/ChangePassword?id=${user_id}`);
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();
    req.flash("successmsg", "Password changed successfully");
    return res.redirect(`/userProfile?id=${user_id}`); // Redirect to a success page or the profile page
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const loadUserAdress = async (req, res) => {
  try {
    const message = req.query.message || null;
    const messageType = req.query.messageType || null;

    const user = req.session.user;
    const addressData = await Address.findOne({ userId: user });
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    res.render("userAddress", {
      user,
      addressData,
      message,
      messageType,
      cartCount,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadAddAddress = async (req, res) => {
  try {
    const message = req.query.message || null;
    const messageType = req.query.messageType || null;

    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    res.render("userAddAddress", {
      user: req.session.user,
      message,
      messageType,
      cartCount,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const addNewAddress = async (req, res) => {
  try {
    const userid = req.session.user;
    const {
      name,
      city,
      district,
      state,
      country,
      mobile,
      pincode,
      home_address,
    } = req.body;
    let errors = [];

    if (!name.trim()) {
      errors.push("Name is required.");
    }
    if (!city.trim()) {
      errors.push("City is required.");
    }
    if (!district.trim()) {
      errors.push("District is required.");
    }
    if (!state.trim()) {
      errors.push("State is required.");
    }
    if (!country.trim()) {
      errors.push("Country is required.");
    }
    if (!home_address.trim()) {
      errors.push("Home address is required.");
    }
    if (!/^\d{10}$/.test(mobile)) {
      errors.push("Mobile number should be exactly 10 digits.");
    }
    if (!/^\d{6}$/.test(pincode)) {
      errors.push("Pincode should be exactly 6 digits.");
    }

    if (errors.length > 0) {
      return res.redirect(
        `/addAddress?message=${encodeURIComponent(
          errors.join(", ")
        )}&messageType=error`
      );
    }

    const address = await Address.findOne({ userId: userid });
    if (address) {
      address.address.push({
        name,
        home_address,
        city,
        district,
        state,
        country,
        mobile,
        pincode,
      });
      await address.save();
      res.redirect(
        "/Address?message=Address added successfully&messageType=success"
      );
    } else {
      const newAddress = new Address({
        userId: userid,
        address: [
          {
            name,
            home_address,
            city,
            district,
            state,
            country,
            mobile,
            pincode,
          },
        ],
      });
      await newAddress.save();
      res.redirect(
        "/Address?message=Address added successfully&messageType=success"
      );
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/addAddress?message=An error occurred&messageType=error");
  }
};

const loadOrderHistory = async (req, res) => {
  try {
    const user = req.session.user;
    const perPage = 4;
    const page = parseInt(req.query.page) || 1;

    const orders = await Order.find({ userId: user })
      .populate("items.productId")
      .populate("userId")
      .skip(perPage * page - perPage)
      .limit(perPage);
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    const count = await Order.countDocuments({ userId: user });

    res.render("orderPage", {
      user,
      orders,
      current: page,
      pages: Math.ceil(count / perPage),
      cartCount,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const editAddress = async (req, res) => {
  try {
    const message = req.query.message || null;
    const messageType = req.query.messageType || null;
    const user = req.session.user;
    const addressId = req.query.id;
    const addressData = await Address.findOne({ userId: user });
    const address = addressData.address.find(
      (addr) => addr._id.toString() === addressId
    );
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    res.render("editAddress", {
      user,
      address,
      message,
      messageType,
      cartCount,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const updateAddress = async (req, res) => {
  try {
    const user = req.session.user;
    const addressId = req.body.address_id;

    const {
      name,
      country,
      state,
      district,
      pincode,
      mobile,
      home_address,
      city,
    } = req.body;
    let errors = [];

    if (!name.trim()) {
      errors.push("Name is required.");
    }
    if (!city.trim()) {
      errors.push("City is required.");
    }
    if (!district.trim()) {
      errors.push("District is required.");
    }
    if (!state.trim()) {
      errors.push("State is required.");
    }
    if (!country.trim()) {
      errors.push("Country is required.");
    }
    if (!home_address.trim()) {
      errors.push("Home address is required.");
    }
    if (!/^\d{10}$/.test(mobile)) {
      errors.push("Mobile number should be exactly 10 digits.");
    }
    if (!/^\d{6}$/.test(pincode)) {
      errors.push("Pincode should be exactly 6 digits.");
    }

    if (errors.length > 0) {
      return res.redirect(
        `/Address?message=${encodeURIComponent(
          errors.join(", ")
        )}&messageType=error`
      );
    }
    // Find the document that contains the address array
    const addressData = await Address.findOne({ userId: user });

    // Update the specific address within the array
    await Address.updateOne(
      { userId: user, "address._id": addressId },
      {
        $set: {
          "address.$.name": name,
          "address.$.city": city,
          "address.$.district": district,
          "address.$.state": state,
          "address.$.country": country,
          "address.$.mobile": mobile,
          "address.$.pincode": pincode,
          "address.$.home_address": home_address,
        },
      }
    );
    res.redirect(
      "/Address?message=Address edited successfully&messageType=success"
    );
  } catch (error) {
    console.log(error.message);
    res.redirect(`/userProfile?id=${user._id}`);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = req.session.user;
    const addressId = req.query.id;

    // Update the specific address within the array
    await Address.updateOne(
      { userId: user },
      {
        $pull: {
          address: { _id: addressId },
        },
      }
    );

    res.redirect(`/Address`);
  } catch (error) {
    console.log(error.message);
  }
};

const loadOrderDetails = async (req, res) => {
  try {
    const user = req.session.user;
    const orderId = req.query.orderId;

    const order = await Order.findOne({ orderId: orderId }).populate(
      "items.productId"
    );

    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    res.render("orderDetails", { user, order, cartCount });
  } catch (error) {
    console.log(error.message);
  }
};




module.exports = {
  loadUserProfile,
  loadEditProfile,
  updateProfile,
  changePasswordLoad,
  securePassword,
  changepassword,
  loadUserAdress,
  loadAddAddress,
  addNewAddress,
  loadOrderHistory,
  editAddress,
  updateAddress,
  deleteAddress,
  loadOrderDetails,
};
