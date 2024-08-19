const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    product:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'products',
                required:true,
            },
            quantity:{
                type:Number,
                required:true,
                default:1
            }
        }
    ]
    
},{
    timestamps:true
  })

module.exports = mongoose.model('cart',cartSchema)