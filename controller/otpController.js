const otpGenerator = require("otp-generator");
const OTP = require("../models/otpModel");
const User = require("../models/UserModel");

const generateOtpfun = async (req, res) => {
  try {
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const email = req.body.email;
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    return otp;
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
module.exports = {
  generateOtpfun,
};
