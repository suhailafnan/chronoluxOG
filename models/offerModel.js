const mongoose = require('mongoose');

const productOfferSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true
    },
    discount: {
        type: Number, 
        required: true
    },
    startDate: {
        type: Date,
        default: () => Date.now()
    },
    expiryDate: {
        type: Date, 
        required: true
    },
    is_active: {
        type: Boolean, 
        default: 0
    }
}, {
    timestamps: true
});

productOfferSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('productOffer', productOfferSchema);