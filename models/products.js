const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    productDiscountPercentage:{
        type: Number
    },
    categoryDiscountPercentage:{
        type: Number
    },
    finalPrice:{
        type: Number
    },
    Description: {
        type: String,
        required: true
    },
    Stock: {
        type: Number,
        required: true
    },
    tax_rate: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
   
    mainimage: {
        type: String,
        required: true
    },
    sub_images1: {
        type: String,
        required: true
    },
    sub_images2: {
        type: String,
        required: true
    },
    is_listed: {
        type: Boolean,
        default: true
    },
    orderCount:{
        type:Number,
        default:0
    
       }
}, {
    timestamps: true
});

module.exports = mongoose.model('products', productSchema);
