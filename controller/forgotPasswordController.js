const User = require("../models/UserModel");
const newgoogleUser = require("../models/googleUser");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const OTP = require("../models/otpModel");
const otpController = require("../controller/otpController");
const flash = require("connect-flash");

const loadForgotPassword = async (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (error) {
    console.log(error);
  }
};

let theOtp = "";

const ForgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (user) {
      const Otp = await otpController.generateOtpfun(req, res);
      theOtp = Otp;
      console.log("otp is:", Otp);
      res.render("resetPasswordOtp", { email: email, user, errormsg: null });
    } else {
      const errormsg = "User not found";
      res.render("forgotPassword", { errormsg });
    }
  } catch (error) {
    console.log(error);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const email = req.body.email;
    const writtenOtp =
      req.body.digit1 +
      req.body.digit2 +
      req.body.digit3 +
      req.body.digit4 +
      req.body.digit5 +
      req.body.digit6;
    console.log("The user written OTP is:", writtenOtp);
    if (theOtp === writtenOtp) {
      console.log("OTP verified successfully");
      return res.redirect(`/resetPassword?email=${email}`);
    } else {
      console.log("OTP does not match");
      // const errormsg = 'OTP does not match';
      // return res.render("resetPasswordOtp", { errormsg, user: req.body.email });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadResetPassword = async (req, res) => {
  try {
    const email = req.query.email;

    res.render("resetPasswordpage", { email });
  } catch (error) {
    console.log(error.message);
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

const updatePassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    // Fetch the user from the database
    const user = await User.findOne({ email: email });
    if (!user) {
      req.flash("errormsg", "User not found");
      return res.redirect(`/forgotEmailSubmit`);
    }

    // Compare oldPassword with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.flash("password is same");
      console.log("password is same");
      return res.redirect(`/login`);
    }
    // Validate the new password and confirmation
    if (password !== confirmPassword) {
      req.flash("errormsg", "New password and confirm password do not match");
      console.log("errormsg", "New password and confirm password do not match");
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
    const hashedPassword = await bcrypt.hash(confirmPassword, salt);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    req.flash("successmsg", "Password changed successfully");
    console.log("successmsg", "Password changed successfully");
    res.redirect(`/login`); // Redirect to a success page or the profile page
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  loadForgotPassword,
  ForgotPassword,
  verifyOtp,
  updatePassword,
  securePassword,
  loadResetPassword,
};
