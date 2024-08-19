const User = require("../models/UserModel");
const Category = require("../models/category");
const Products = require("../models/products");

const createCatogery = async (req, res) => {
  try {
    const { name, Description } = req.body;
    let errors = [];

    if (!name.trim()) {
      errors.push("Name is required.");
    }
    if (!Description.trim()) {
      errors.push("Description is required.");
    }

    const existCategory = await Category.find({
      $and: [{ name: name }],
    });
    if (existCategory.length > 0) {
      console.log("existing foundd");
      errors.push("This category already exist.");
    }
    if (errors.length > 0) {
      return res.redirect(
        `/admin/page_Categories?message=${encodeURIComponent(
          errors.join(", ")
        )}&messageType=error`
      );
    }
    const catogeries = new Category({
      name,
      Description,
    });
    const categoryData = await catogeries.save();
    res.redirect(
      "/admin/page_Categories?message=Category added successfully&messageType=success"
    );
  } catch (error) {
    console.log(error.message);
  }
};

const loadCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;
    const message = req.query.message || null;
    const messageType = req.query.messageType || null;
    const totalCategories = await Category.countDocuments();
    const categories = await Category.find().skip(skip).limit(limit);
    const totalPages = Math.ceil(totalCategories / limit);

    res.render("pageCategories", {
      catogeries: categories,
      currentPagess: page,
      totalPages: totalPages,
      adminId: req.session.user_id,
      message,
      messageType,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

const editCategoryLoad = async (req, res) => {
  try {
    const message = req.query.message || null;
    const messageType = req.query.messageType || null;
    const id = req.query.id;
    const categoryData = await Category.findById(id);
    if (categoryData) {
      const categories = await Category.find();
      res.render("edit_categories", {
        category: categoryData,
        adminId: req.session.user_id,
        message,
        messageType,
      });
    } else {
      console.log("Category not found");
    }
  } catch (error) {
    console.error("Error:", error);

    res.status(500).send("Internal Server Error");
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, Description, category_id } = req.body;
    let errors = [];

    if (!name.trim()) {
      errors.push("Name is required.");
    }
    if (!Description.trim()) {
      errors.push("Description is required.");
    }

    const existingCategory = await Category.findOne({
      name: name,
      _id: { $ne: category_id },
    });

    if (existingCategory) {
      console.log("Category name already exists.");
      errors.push("Category name already exists.");
    }

    if (errors.length > 0) {
      return res.redirect(
        `/admin/page_Categories?message=${encodeURIComponent(
          errors.join(", ")
        )}&messageType=error`
      );
    }

    await Category.findByIdAndUpdate(category_id, {
      $set: {
        name: name,
        Description: Description,
      },
    });

    res.redirect(
      "/admin/page_Categories?message=Category updated successfully&messageType=success"
    );
  } catch (error) {
    console.log(error.message);
    res.redirect(
      `/admin/page_Categories?message=Something went wrong&messageType=error`
    );
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    await Category.deleteOne({ _id: id });
    await Products.deleteMany({ category: id });
    res.redirect(
      "/admin/page_Categories?message=Category Deleted successfully&messageType=success"
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
};

module.exports = {
  createCatogery,
  loadCategories,
  editCategoryLoad,
  updateCategory,
  deleteCategory,
};
