const User = require("../models/UserModel");
const Category = require("../models/category");
const Products = require("../models/products");
const bcrypt = require("bcrypt");

const loadAddProduct = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("page_add_products", {
      categories: categories,
      errors: [],
      adminId: req.session.user_id,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const AddProductTo = async (req, res) => {
  try {
    const { tax_rate, stock, price, product_name, Full_description, category } =
      req.body;
    const uploadedImageName = req.files.mainimage
      ? req.files.mainimage[0].filename
      : "";
    const uploadedSub_images1 = req.files.sub_images1
      ? req.files.sub_images1[0].filename
      : "";
    const uploadedSub_images2 = req.files.sub_images2
      ? req.files.sub_images2[0].filename
      : "";
    const categories = await Category.find();

    let errors = [];
    if (!uploadedImageName || !uploadedSub_images1 || !uploadedSub_images2) {
      errors.push("All three images are required.");
    }

    if (price <= 0) {
      errors.push("Price should be greater than 0.");
    }
    if (stock < 0) {
      errors.push("Stock should be greater than or equal to 0.");
    }
    if (tax_rate < 0) {
      errors.push("Tax rate should be greater than or equal to 0.");
    }

    if (!product_name.trim()) {
      errors.push("Product name is required.");
    }

    if (!Full_description.trim()) {
      errors.push("Full description is required.");
    }

    if (errors.length > 0) {
      return res.render("page_add_products", {
        categories: categories,
        errors: errors,
      });
    }

    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      errors.push("Category not found.");
      return res.render("page_add_products", {
        categories: categories,
        errors: errors,
      });
    }

    const products = new Products({
      name: product_name,
      price: price,
      Description: Full_description,
      category: categoryDoc._id,
      Stock: stock,
      tax_rate: tax_rate,
      mainimage: uploadedImageName,
      sub_images1: uploadedSub_images1,
      sub_images2: uploadedSub_images2,
    });

    await products.save();
    res.redirect(
      "/admin/products_list?message=Product added successfully&messageType=success"
    );
  } catch (error) {
    console.error("Error:", error);
    res.redirect(
      "/admin/products_list?message=Failed to add product&messageType=error"
    );
  }
};

const loadProductList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;
    const message = req.query.message || null;
    const messageType = req.query.messageType || null;
    const totalProducts = await Products.countDocuments();
    const products = await Products.find()
      .populate("category")
      .skip(skip)
      .limit(limit);
    const categories = await Category.find();
    const totalPages = Math.ceil(totalProducts / limit);
    res.render("product_list", {
      product: products,
      categories: categories,
      currentPage: page,
      totalPages: totalPages,
      message: message,
      messageType: messageType,
      adminId: req.session.user_id,
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;

    const user = req.session.user;

    await Products.deleteOne({ _id: id });
    res.redirect("/admin/products_list");
  } catch (error) {
    console.log(error.message);
  }
};
const editProductLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const ProductData = await Products.findById(id).populate("category");
    const categorydata = await Category.find();
    if (ProductData) {
      res.render("edit_product", {
        Product: ProductData,
        categorydata,
        adminId: req.session.user_id,
      });
    } else {
      console.log("Products not found");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      tax_rate,
      stock,
      price,
      product_name,
      Full_description,
      category,
      product_id,
    } = req.body;
    if (!product_id) {
      return res.redirect(
        "/admin/products_list?message=Product ID is missing&messageType=error"
      );
    }
    const product = await Products.findById(product_id);
    if (!product) {
      return res.redirect(
        "/admin/products_list?message=Product not found&messageType=error"
      );
    }
    const uploadedImageName = req.files.mainimage
      ? req.files.mainimage[0].filename
      : product.mainimage;
    const uploadedSub_images1 = req.files.sub_images1
      ? req.files.sub_images1[0].filename
      : product.sub_images1;
    const uploadedSub_images2 = req.files.sub_images2
      ? req.files.sub_images2[0].filename
      : product.sub_images2;

    let errors = [];
    if (!uploadedImageName || !uploadedSub_images1 || !uploadedSub_images2) {
      errors.push("All three images are required.");
    }
    if (price <= 0) {
      errors.push("Price should be greater than 0.");
    }

    if (stock <= 0) {
      errors.push("stock should be greater than 0.");
    }
    if (tax_rate < 0) {
      errors.push("Tax rate should be greater than 0.");
    }
    if (!product_name.trim()) {
      errors.push("Product name is required.");
    }
    if (!Full_description.trim()) {
      errors.push("Full description is required.");
    }

    if (errors.length > 0) {
      return res.redirect(
        `/admin/products_list?message=${encodeURIComponent(
          errors.join(", ")
        )}&messageType=error`
      );
    }

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.redirect(
        "/admin/products_list?message=Category not found&messageType=error"
      );
    }

    await Products.findByIdAndUpdate(
      product_id,
      {
        $set: {
          name: product_name,
          price: price,
          Description: Full_description,
          category: categoryDoc._id,
          Stock: stock,
          tax_rate: tax_rate,
          mainimage: uploadedImageName,
          sub_images1: uploadedSub_images1,
          sub_images2: uploadedSub_images2,
        },
      },
      { new: true }
    );

    res.redirect(
      "/admin/products_list?message=Product updated successfully&messageType=success"
    );
  } catch (error) {
    console.error("Error:", error.message);
    res.redirect(
      `/admin/products_list?message=${encodeURIComponent(
        error.message
      )}&messageType=error`
    );
  }
};

module.exports = {
  loadAddProduct,
  AddProductTo,
  loadProductList,
  deleteProduct,
  editProductLoad,
  updateProduct,
};
