const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number
    },
    history: [{
        amount: {
            type: Number
        },
        transactionType: {
            enum: ["credited", "withdraw", "Ordered","razorpay","return","cancel","Referal","Referal bonus","First order bonus","Referral bonus","cancel Order Amount","Return Order Amount"],
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        },
        previousBalance: {
            type: Number
        }
    }]
});

module.exports = mongoose.model('Wallet', walletSchema);
