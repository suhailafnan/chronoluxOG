const User = require("../models/UserModel");
const newgoogleUser = require("../models/googleUser");
const Category = require("../models/category");
const Products = require("../models/products");
const Cart = require("../models/cart");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const OTP = require("../models/otpModel");
const otpController = require("../controller/otpController");
const flash = require("connect-flash");
const productOffer = require("../models/offerModel");
const categoryOffer = require("../models/categoryOffer");
const crypto = require("crypto");
const Wallet = require("../models/walletModel");
// for loading the website this method is called
const loadWebpage = async (req, res) => {
  try {
    let cartCount = 0;
    const products = await Products.find().limit(4);
    res.render("index", { user: req.session.user, products, cartCount });
  } catch (error) {
    console.log(error.messsage);
  }
};

const generateRandomId = () => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomId = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomBytes(1)[0] % alphabet.length;
    randomId += alphabet[randomIndex];
  }
  return randomId;
};



const loadHomepage = async (req, res) => {
  try {
    const products = await Products.find().limit(4);
    let cartCount = 0;
    const user= req.session.user
    if (user) {
      const cart = await Cart.findOne({ userId: user._id});
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    res.render("index", {
      user,
      products,
      cartCount,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// for loading the sign in page
const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.messsage);
  }
};

// for loading the register this method is called
const loadRegister = async (req, res) => {
  try {
    const referedCode = req.query.referenceCode;
    req.session.referedCode = referedCode;
    if (referedCode) {
      console.log("referenceCode is::::::::::::::::", referedCode);
    } else {
      console.log("Error in getting referenceCode");
    }
    res.render("signup");
  } catch (error) {
    console.log(error.messsage);
  }
};

const veriyfyLogin = async (req, res) => {
  try {
    const email = req.body.your_email;
    const password = req.body.your_pass;
    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (!userData.is_blocked) {
          req.session.user = userData; // Store the entire user object in session
          res.redirect("/home");
        } else {
          res.render("login", { message: "YOU HAVE BEEN BLOCKED BY ADMIN" });
        }
      } else {
        res.render("login", { message: "Email or password is incorrect" });
      }
    } else {
      res.render("login", { message: "Email or password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("login", { message: "An error occurred during login" });
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

// otp validation loading page

// const loadOtp = async (req, res) => {
//   try {
//     let message = req.flash("message");
//     res.render("otpVerification", {
//       message,
//     });
//   } catch (error) {
//     console.log(error.messsage);
//   }
// };

// for inserting user to database this method is called

let theOtp = "";

const insertUser = async (req, res) => {
  try {
    const { name, email, password, re_pass } = req.body;
    const referedCode = req.session.referedCode;

    if (referedCode) {
      console.log("referenceCode is::::::::::::::::", referedCode);
    }
    if (!name.trim()) {
      res.render("signup", { message: "Name is required" });
      return;
    }

    // Check whether this user exists
    const existUser = await User.findOne({ email });
    if (existUser) {
      res.render("signup", { message: "User already exists" });
      return;
    }

    // Define the password criteria
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

    if (!passwordRegex.test(password)) {
      res.render("signup", {
        message:
          "Password must be at least 6 characters long, contain one uppercase letter, one number, and one special character.",
      });
      return;
    }

    if (password === re_pass) {
      const randomReferenceCode = await generateRandomId();
      const spassword = await securePassword(password);

      const user = new User({
        name,
        email,
        password: spassword,
        is_admin: 0,
        is_verified: 0,
        referenceCode: randomReferenceCode,
      });

      // Add referedCode if referenceCode is present
      if (referedCode) {
        user.referedCode = referedCode;
      }

      const userData = await user.save();

      if (userData) {
        const user = await User.findOne({ email });
        const otpBody = await otpController.generateOtpfun(req, res);
        res.render("otpVerification", { email: email, user });
        console.log(userData);
        console.log("otp is :", otpBody);
        theOtp = otpBody;
      }
    } else {
      res.render("signup", {
        message: "Your password doesn't match",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadResendOtp = async (req, res) => {
  try {
    const email = req.query.email; // Retrieve the email from query parameters
    console.log("Resending OTP for email:", email);
    const user = await User.findOne({ email: email });
    if (user) {
      // Generate a new OTP
      console.log("hello resend otppp");
      // const user=await User.findOne({email})
      const otpBody = await otpController.generateOtpfun(req, res);
      res.render("otpVerification", { email: email, user });
      console.log(user);
      console.log("otp is :", otpBody);
      theOtp = otpBody;
      // Send response indicating success
      console.log(email);
      console.log(userData);
      res
        .status(200)
        .send({ success: true, message: "New OTP has been sent." });
    } else {
      // If user not found, send response indicating failure
      res.status(404).send({ success: false, message: "User not found." });
    }
  } catch (error) {
    console.log(error.message);
    // Send response indicating error
    res
      .status(500)
      .send({
        success: false,
        message: "An error occurred while resending OTP.",
      });
  }
};
// here we should give the otp verification in the user side

const verifyOtp = async (req, res) => {
  try {
    //const email = req.body.email;
    let writtenOtp =
      req.body.digit1 +
      req.body.digit2 +
      req.body.digit3 +
      req.body.digit4 +
      req.body.digit5 +
      req.body.digit6;
    console.log("The user written OTP is: ", writtenOtp);
    if (theOtp === writtenOtp) {
      res.redirect("/login");
    } else {
      console.log("User is blocked or not found");
      res.render("otpverification", {
        message: "Your OTP doesn't match or user is blocked",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// google authentication and loginn

const loadAuth = (req, res) => {
  //res.render('auth');
  res.render("index");
};

const successGoogleLogin = async (req, res) => {
  if (!req.user) {
    res.redirect("/failure");
  } else {
    const googleUser = new newgoogleUser({
      name: req.user.displayName,
      email: req.user.email,
      is_admin: 0,
      is_verified: 0,
    });
    const userData = await googleUser.save();
    console.log(req.user);
    res.redirect("/home");
  }
};

const failureGoogleLogin = (req, res) => {
  res.send("Error");
};

const loadShop = async (req, res) => {
  try {
    const user = req.session.user;
    const categories = await Category.find();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const selectedCategory = req.query.category; // Get the selected category from the query parameters

    let query = {};
    if (selectedCategory) {
      query.category = selectedCategory;
    }
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    const products = await Products.find(query).skip(skip).limit(limit);
    const activeProductOffers = await productOffer.find({ is_active: true });
    const activeCategoryOffers = await categoryOffer.find({ is_active: true });

    for (let product of products) {
      const productOffer = activeProductOffers.find(
        (o) => o.productId.toString() === product._id.toString()
      );
      const categoryOffer = activeCategoryOffers.find(
        (o) => o.categoryId.toString() === product.category.toString()
      );

      let finalPrice = product.price;
      let productDiscountPercentage = 0;
      let categoryDiscountPercentage = 0;

      if (productOffer && categoryOffer) {
        const productDiscount = productOffer.discount;
        const categoryDiscount = categoryOffer.discount;

        if (productDiscount >= categoryDiscount) {
          finalPrice -= Math.ceil(finalPrice * (productDiscount / 100));
          productDiscountPercentage = productDiscount;
        } else {
          finalPrice -= Math.ceil(finalPrice * (categoryDiscount / 100));
          categoryDiscountPercentage = categoryDiscount;
        }
      } else if (productOffer) {
        const productDiscount = productOffer.discount;
        finalPrice -= Math.ceil(finalPrice * (productDiscount / 100));
        productDiscountPercentage = productDiscount;
      } else if (categoryOffer) {
        const categoryDiscount = categoryOffer.discount;
        finalPrice -= Math.ceil(finalPrice * (categoryDiscount / 100));
        categoryDiscountPercentage = categoryDiscount;
      }

      product.finalPrice = finalPrice;
      product.productDiscountPercentage = productDiscountPercentage;
      product.categoryDiscountPercentage = categoryDiscountPercentage;

      await product.save();
    }

    const totalProducts = await Products.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    res.render("shop", {
      categories,
      products,
      user,
      currentPage: page,
      totalPages,
      selectedCategory,
      cartCount,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const loadShopDetials = async (req, res) => {
  try {
    const id = req.query.ProductId;

    const product = await Products.findById(id).populate("category");

    const relatedProducts = await Products.find({
      category: product.category._id,
      _id: { $ne: product._id },
    }).limit(4);

    const categories = await Category.find();
    let cartCount = 0;

    if (req.session.user) {
      const cart = await Cart.findOne({ userId: req.session.user._id });
      if (cart && cart.product) {
        cartCount = cart.product.length;
      }
    }
    res.render("product_details", {
      categories: categories,
      products: product,
      relatedProducts: relatedProducts,
      user: req.session.user,
      cartCount,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const getProducts = async (req, res) => {
  let sortOption = req.query.sort || "";
  let sortCriteria = {};

  switch (sortOption) {
    case "priceLowHigh":
      sortCriteria = { price: 1 };
      break;
    case "priceHighLow":
      sortCriteria = { price: -1 };
      break;
    case "nameAZ":
      sortCriteria = { name: 1 };
      break;
    default:
      sortCriteria = {};
      break;
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    const products = await Products.find().sort(sortCriteria);
    const categories = await Category.find();
    const totalProducts = await Products.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);
    res.render("shop", {
      products: products,
      categories: categories,
      currentPage: page,
      user: req.session.user,
      totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

const search = async (req, res) => {
  try {
    const query = req.query.query;
    const regex = new RegExp(query, "i");

    const products = await Products.find({ name: regex });
    res.json(products);
  } catch (error) {
    console.log(error.message);
  }
};

const blocked = async (req, res) => {
  try {
    // console.log("fasdouhgf9u")
    // res.json(products);
    res.render("blockedPage");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  loadLogin,
  generateRandomId,
  veriyfyLogin,
  insertUser,
  loadWebpage,
  // loadOtp,
  userLogout,

  verifyOtp,
  loadResendOtp,
  loadAuth,
  successGoogleLogin,
  failureGoogleLogin,
  loadShop,
  loadShopDetials,
  loadHomepage,
  getProducts,
  search,
  blocked,
};
