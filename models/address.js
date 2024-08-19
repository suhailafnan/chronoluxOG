const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    address:[{

        name:{
            type:String,
            required:true
        },

        city:{
            type:String,
            required:true
        },

        district:{
            type:String,
            required:true
        },

        state:{
            type:String,
            required:true
        },

        country:{
            type:String,
            required:true
        },

        mobile:{
            type:Number,
            required:true
        },

        pincode:{
            type:Number,
            required:true
        },
        home_address:{
            type:String
            
        }


    }]

},{
    timestamps:true
 })


module.exports = mongoose.model('address',addressSchema)
