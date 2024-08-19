const User = require("../models/UserModel");
const Category = require("../models/category");
const Products = require("../models/products");
const Cart = require("../models/cart");
const productOffer = require("../models/offerModel");
const categoryOffer = require("../models/categoryOffer");

const loadOfferAddingPage = async (req, res) => {
  try {
    const products = await Products.find({ is_listed: true });
    res.render("addOffer", { products, adminId: req.session.user_id });
  } catch (error) {
    console.log(error);
  }
};

const loadCategoryOfferAddingPage = async (req, res) => {
  try {
    const categorys = await Category.find({ is_listed: true });
    res.render("addCategoryOffer", { categorys, adminId: req.session.user_id });
  } catch (error) {
    console.log(error);
  }
};

const loadOfferPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    const products = await Products.find({ is_listed: true });
    const productOffers = await productOffer
      .find()
      .populate("productId")
      .skip(skip)
      .limit(limit);
    const totalOffers = await productOffer.countDocuments();
    const totalPages = Math.ceil(totalOffers / limit);

    res.render("productOffer", {
      products,
      productOffers,
      currentPage: page,
      totalPages,
      adminId: req.session.user_id,
    });
  } catch (error) {
    console.log(error);
  }
};

const loadCategoryOfferPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    const category = await Category.find({ is_listed: true });
    const categoryOffers = await categoryOffer
      .find()
      .populate("categoryId")
      .skip(skip)
      .limit(limit);
    const totalOffers = await categoryOffer.countDocuments();
    const totalPages = Math.ceil(totalOffers / limit);

    res.render("categoryOffer", {
      category,
      categoryOffers,
      currentPage: page,
      totalPages,
      adminId: req.session.user_id,
    });
  } catch (error) {
    console.log(error);
  }
};

const addOffer = async (req, res) => {
  try {
    const { productId, discount, startDate, expiryDate, is_active } = req.body;

    const newOffer = new productOffer({
      productId,
      discount,
      startDate: startDate || Date.now(),
      expiryDate,
      is_active: is_active ? true : false,
    });

    await newOffer.save();
    res.redirect("/admin/Offer");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/addOfferPage");
  }
};

const addCategoryOffer = async (req, res) => {
  try {
    const { categoryId, discount, startDate, expiryDate, is_active } = req.body;

    const existsOffer = await categoryOffer.findOne({
      $and: [{ categoryId: categoryId }, { startDate: startDate }],
    });

    if (existsOffer) {
      //    res.status(200).send({ success:false, message: 'offer for this category is already given with same starting date' });
      console.log("Existing offer found");
      return res.redirect("/admin/CategoryOffer");
    } else {
      const newOffer = new categoryOffer({
        categoryId,
        discount,
        startDate: startDate || Date.now(),
        expiryDate,
        is_active: is_active ? true : false,
      });

      await newOffer.save();
      res.redirect("/admin/CategoryOffer");
      // res.status(200).send({ success: true, message: 'category offer added' });
    }
  } catch (error) {
    console.log(error);
    res.redirect("/admin/CategoryOffer");
  }
};
// const addCategoryOffer = async (req, res) => {
//     try {
//         cosole.log("hekllooooo")
//         const { categoryId, discount, startDate, expiryDate, is_active } = req.body;
//         const existsOffer = await categoryOffer.findOne({
//             categoryId: categoryId,
//             startDate: startDate
//         });

//         if (existsOffer) {
//             console.log("Existing offer found");
//             res.status(200).json({ success: false, message: 'Offer for this category is already given with the same starting date' });
//         } else {
//             const newOffer = new categoryOffer({
//                 categoryId,
//                 discount,
//                 startDate: startDate || Date.now(),
//                 expiryDate,
//                 is_active: is_active ? true : false
//             });

//             await newOffer.save();
//             console.log("Offer added successfully");
//             res.status(200).json({ success: true, message: 'Category offer added successfully' });
//         }

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: 'An error occurred while adding the category offer' });
//     }
// };

const deleteCategoryOffer = async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
    console.log(categoryId);
    await categoryOffer.deleteOne({ _id: categoryId });
    res.json({
      success: true,
      message: "Category offer deleted successfully.",
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: "Failed to delete the category offer.",
    });
  }
};

const deleteProductOffer = async (req, res) => {
  try {
    const offerId = req.query.offerId;
    console.log(offerId);
    await productOffer.deleteOne({ _id: offerId });
    res.json({ success: true, message: "product offer deleted successfully." });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: "Failed to delete the product offer.",
    });
  }
};

module.exports = {
  loadOfferAddingPage,
  loadCategoryOfferAddingPage,
  loadOfferPage,
  loadCategoryOfferPage,
  addOffer,
  addCategoryOffer,
  deleteCategoryOffer,
  deleteProductOffer,
};
