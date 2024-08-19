const express = require("express");
const admin_route = express();
const session = require("express-session");
const config = require("../config/config");
const nocache = require("nocache");
const adminAuth = require("../middleware/adminAuth");
const adminController = require("../controller/adminController")
const flash=require("express-flash");
const path=require("path")
const adminOrderController = require("../controller/adminOrderController")
const offerController = require("../controller/offerController")
const categoryController = require("../controller/categoryController")
const productController = require("../controller/productController")
const couponController = require("../controller/couponController")

const adminSalesReportController = require("../controller/adminSalesReportController")
admin_route.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));

admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

admin_route.use(nocache());
admin_route.use(flash());



const productMulter=require("../middleware/multerController")


admin_route.get("/",adminAuth.isLogout,adminController.adminLoadLogin);
admin_route.post("/", adminAuth.isLogout,adminController.verifyAdminLogin);
admin_route.get("/home",adminAuth.isLogin,adminController.loadAdminHome);
admin_route.get('/logoutAdminProfile', adminAuth.isLogin, adminController.adminLogout);
admin_route.get("/page_users",adminAuth.isLogin,adminController.loadUsers);
admin_route.get("/delete-user", adminAuth.isLogin,adminController.deleteUser);
admin_route.post("/block-user", adminAuth.isLogin,adminController.blockUser);
admin_route.post("/Unblock-user", adminAuth.isLogin,adminController.unblockUser);

admin_route.get("/page_Categories",adminAuth.isLogin,categoryController.loadCategories);
admin_route.post("/createCatogery",adminAuth.isLogin, categoryController.createCatogery);
admin_route.get("/edit_category", adminAuth.isLogin,categoryController.editCategoryLoad);
admin_route.post("/updateCatogery",adminAuth.isLogin, categoryController.updateCategory);
admin_route.get("/delete_category",adminAuth.isLogin, categoryController.deleteCategory);



admin_route.get("/page_product",adminAuth.isLogin,productController.loadAddProduct);
admin_route.post("/add_product",adminAuth.isLogin, productMulter, productController.AddProductTo);
admin_route.get("/products_list",adminAuth.isLogin,productController.loadProductList);
admin_route.get("/edit_Product", adminAuth.isLogin,productController.editProductLoad);
admin_route.post("/update_product",adminAuth.isLogin, productMulter,productController.updateProduct); 
admin_route.get("/delete_Product",adminAuth.isLogin, productController.deleteProduct);


admin_route.get("/orderDetails",adminAuth.isLogin,adminOrderController.loadorderDetails);
admin_route.get('/orderViewPage',adminAuth.isLogin, adminOrderController.loadorderViewPage);
admin_route.post('/updateOrderStatus',adminAuth.isLogin, adminOrderController.updateOrderStatus);

// offersssssssss

admin_route.get('/Offer', adminAuth.isLogin,offerController.loadOfferPage);
admin_route.get('/addOfferPage',adminAuth.isLogin, offerController.loadOfferAddingPage);
admin_route.post('/addOffer', adminAuth.isLogin,offerController.addOffer);
admin_route.get('/CategoryOffer',adminAuth.isLogin, offerController.loadCategoryOfferPage);
admin_route.get('/addcategoryOfferPage', adminAuth.isLogin,offerController.loadCategoryOfferAddingPage);
admin_route.post('/addCategoryOffer', adminAuth.isLogin,offerController.addCategoryOffer);
admin_route.get('/deleteCategoryOffer', adminAuth.isLogin,offerController.deleteCategoryOffer);
admin_route.get('/deleteProductOffer',adminAuth.isLogin, offerController.deleteProductOffer);

  
// couponnnsssssssss

admin_route.get('/adminCouponPage', adminAuth.isLogin,couponController.loadAdminCouponPage);
admin_route.post('/addCoupon', adminAuth.isLogin,couponController.addCoupon);
admin_route.post('/deleteCoupon',adminAuth.isLogin, couponController.deleteCoupon);
admin_route.get('/editCoupon',adminAuth.isLogin, couponController.loadEditCouponPage);
admin_route.post('/editCoupon',adminAuth.isLogin, couponController.editCouponPage);



// sales reportsss
admin_route.get('/salesReport', adminAuth.isLogin,adminSalesReportController.loadSalesReport);
admin_route.get('/downloadExcel',adminAuth.isLogin,adminSalesReportController.downloadExcel)
 admin_route.get('/downloadPDF',adminAuth.isLogin,adminSalesReportController.downloadPDF)
admin_route.get('/adminBestSalePage', adminAuth.isLogin,adminSalesReportController.adminBestSalePageLoad);
admin_route.post('/chartData', adminAuth.isLogin,adminSalesReportController.chartSortby);


module.exports = admin_route;