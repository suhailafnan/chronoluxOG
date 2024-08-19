const express = require("express");
const user_route = express();
const session=require("express-session")
const config =require("../config/config")
const userController = require("../controller/userController");
const otpController = require('../controller/otpController');
const cartController = require("../controller/cartController");
const userProfileController = require("../controller/userProfileController");
const checkOutController = require("../controller/checkOutController");
const forgotPasswordController = require("../controller/forgotPasswordController");
const userOrderController = require("../controller/userOrderController");
const userWishlistController = require("../controller/userWishlistController");

const onlinePaymentController= require("../controller/onlinePaymentController");
const userWalletController = require("../controller/userWalletController");
const userCouponController = require("../controller/userCouponController")
const flash=require("express-flash")
const nocache = require("nocache");
const auth = require("../middleware/auth");

const userBlogAndThings= require("../controller/userBlogAndThings")


user_route.use(nocache());
const passport = require('passport'); 
require('../passport');
user_route.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
user_route.use(express.json());
user_route.use(passport.initialize()); 
user_route.use(passport.session());
user_route.use(
    session({
    secret:config.sessionSecret,
      resave: false,
      saveUninitialized: false,
    })
  );
user_route.use(flash())
user_route.use(express.json());
user_route.set("view engine", "ejs");
user_route.set("views", "./views/users/");



user_route.get('/', auth.isLogout, userController.loadWebpage);
user_route.get('/register', auth.isLogout, userController.loadRegister);
user_route.post('/register', auth.isLogout, userController.insertUser);
// user_route.get('/register', auth.isLogout, userController.insertUser);
user_route.get('/login', auth.isLogout, userController.loadLogin);
user_route.post('/login', auth.isLogout, userController.veriyfyLogin);
// user_route.get('/otpverify', auth.isLogout, userController.loadOtp);
// user_route.get('/forgotPassword', auth.isLogout, userController.loadforgotPassword);
user_route.post('/verify', auth.isLogout, userController.verifyOtp);
user_route.get('/resendOtp', auth.isLogout, userController.loadResendOtp);

user_route.get('/logoutProfile', auth.isLogin,auth.isUnblocked, userController.userLogout);
user_route.get('/shop',auth.isLogin,auth.isUnblocked,userController.loadShop);
user_route.get('/shop_details',auth.isLogin,auth.isUnblocked,userController.loadShopDetials);
user_route.get('/shopSort',  auth.isLogin,auth.isUnblocked,userController.getProducts);
user_route.get('/search', auth.isLogin,auth.isUnblocked, userController.search);
// login only routes routes
user_route.get('/home', auth.isLogin,auth.isUnblocked, userController.loadHomepage);
// user_route.post('/resendOtp', userController.loadResendOtp);
//google authenticationn
// Auth 
user_route.get('/auth/google' , passport.authenticate('google', { scope: 
	[ 'email', 'profile' ] 
})); 
// Auth Callback 
user_route.get( '/auth/google/callback', 
	passport.authenticate( 'google', { 
		successRedirect: '/success', 
		failureRedirect: '/failure'
}));
// Success 
user_route.get('/success' , userController.successGoogleLogin); 
// failure 
user_route.get('/failure' , userController.failureGoogleLogin);
// homepages 
user_route.get('/blocked' ,userController.blocked);
// forgot passwords route 
user_route.get('/forgotPassword', auth.isLogout, forgotPasswordController.loadForgotPassword);
user_route.post('/forgotEmailSubmit', auth.isLogout, forgotPasswordController.ForgotPassword);
user_route.post('/resetPasswordOtp', auth.isLogout, forgotPasswordController.verifyOtp);
user_route.get('/resetPassword', auth.isLogout, forgotPasswordController.loadResetPassword);
user_route.post('/updatePassword', auth.isLogout, forgotPasswordController.updatePassword);
// user profile routes are here
user_route.get('/userProfile',auth.isLogin,auth.isUnblocked,userProfileController.loadUserProfile);
user_route.get('/EditProfile',auth.isLogin,auth.isUnblocked,userProfileController.loadEditProfile);
user_route.post('/updateProfile',auth.isLogin,auth.isUnblocked,userProfileController.updateProfile);
user_route.get('/ChangePassword',auth.isLogin,auth.isUnblocked, userProfileController.changePasswordLoad);
user_route.post('/changePassword',auth.isLogin,auth.isUnblocked, userProfileController.changepassword);
user_route.get('/Address',auth.isLogin,auth.isUnblocked,userProfileController.loadUserAdress);
user_route.get('/addAddress',auth.isLogin,auth.isUnblocked,userProfileController.loadAddAddress);
user_route.post('/addAddress',auth.isLogin,auth.isUnblocked,userProfileController.addNewAddress);
user_route.get('/editaddress',auth.isLogin,auth.isUnblocked,userProfileController.editAddress);
user_route.post('/updateAddress',auth.isLogin,auth.isUnblocked,userProfileController.updateAddress);
user_route.get('/deleteAddress',auth.isLogin,auth.isUnblocked,userProfileController.deleteAddress);
user_route.get('/OrderHistory',auth.isLogin,auth.isUnblocked,userProfileController.loadOrderHistory);
user_route.get('/orderDetails',auth.isLogin,auth.isUnblocked,userProfileController.loadOrderDetails);
// from here the carts route are set here
user_route.get('/cart',auth.isLogin,auth.isUnblocked,cartController.loadCart);
user_route.post('/addToCart', auth.isLogin,auth.isUnblocked,cartController.addToCart);
user_route.post('/removeProduct', auth.isLogin,auth.isUnblocked,cartController.removeFromCart);
user_route.post('/update-quantity', auth.isLogin,auth.isUnblocked,cartController.updateQuantity);
user_route.post('/checkQuantity', auth.isLogin,auth.isUnblocked,cartController.checkQuantity);
// check out page 
user_route.get('/checkOut',auth.isLogin,auth.isUnblocked,checkOutController.loadcheckOutPage);
user_route.post('/placeOrder',auth.isLogin,auth.isUnblocked,checkOutController.addToPlaceOrder);
user_route.get('/orderConfirmation',auth.isLogin,auth.isUnblocked,checkOutController.orderConfirmation);

// order constroller
user_route.post('/cancelOrder', auth.isLogin,auth.isUnblocked,userOrderController.cancelOrder);
user_route.post('/submitReturnReason', auth.isLogin,auth.isUnblocked,userOrderController. returnOrder);
user_route.post('/downloadInvoice', auth.isLogin,userOrderController. downloadInvoice);
// wishlist adddinggg
user_route.post('/addToWishlist',auth.isLogin,auth.isUnblocked, userWishlistController.addToWishlist);
user_route.get('/wishlist',auth.isLogin, auth.isUnblocked,userWishlistController.loadWishlist);
user_route.post('/removeFromWishlist',auth.isLogin,auth.isUnblocked, userWishlistController.removeFromWishlist);

user_route.post('/addToCartFromWshlist',auth.isLogin,auth.isUnblocked, userWishlistController.addToCartFromWshlist);


// wallet croutes

user_route.get('/Wallet',auth.isLogin,auth.isUnblocked, userWalletController.loadWallet);

 user_route.post('/razorpay',auth.isLogin,auth.isUnblocked,onlinePaymentController.openRazorpay);
 user_route.post('/razorpayyy',auth.isLogin,auth.isUnblocked,onlinePaymentController.openRazorpayWallet);

 user_route.post('/razorpayRePayment',auth.isLogin,auth.isUnblocked,onlinePaymentController.openRePaymentRazorpay);
 user_route.post('/addToWallet', auth.isLogin,auth.isUnblocked,userWalletController.addToWallet);
 user_route.post('/withdrawMoney',auth.isLogin,auth.isUnblocked, userWalletController. withdrawMoney);
 user_route.get('/viewTransaction',auth.isLogin,auth.isUnblocked, userWalletController.viewTransaction);
// user_route.get('/onlinePayment',auth.isLogin,auth.isUnblocked,onlinePaymentController.onlineorderConfirmation);

// user_route.post('/placeOrderWithWallet',auth.isLogin,auth.isUnblocked, userWalletController. placeOrderWithWallet);

// user_route.get('/walletOrderConfirmation',auth.isLogin,auth.isUnblocked, userWalletController.walletOrderConfirmation);
user_route.post('/placeOrderWithWallet', auth.isLogin,auth.isUnblocked,checkOutController. placeOrderWithWallet);
user_route.get('/walletOrderConfirmation',auth.isLogin,auth.isUnblocked,checkOutController.walletOrderConfirmation);



// userCouponController

user_route.get('/Coupon',auth.isLogin,auth.isUnblocked,userCouponController.loadCoupon);
user_route.post('/applyCoupon',auth.isLogin, auth.isUnblocked,checkOutController.applyCoupon);
user_route.post('/paymentFailed',auth.isLogin, auth.isUnblocked,checkOutController.paymentFailed);

user_route.post('/rePayment',auth.isLogin, auth.isUnblocked,checkOutController.rePaymentSuccess);


user_route.get('/about',auth.isLogin,auth.isUnblocked,userBlogAndThings.loadAbout);
user_route.get('/blogDetails',auth.isLogin,auth.isUnblocked,userBlogAndThings.loadBlogDetails);

user_route.get('/contact',auth.isLogin,auth.isUnblocked,userBlogAndThings.loadContact);
module.exports = user_route;

