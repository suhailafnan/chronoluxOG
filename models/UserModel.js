const mongoose=require("mongoose");
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
      },
      email:{
          type:String,
          required:true
        },
      mobile:{
          type:String,
         
        },
        password:{
          type:String,
          required:true
        },
        is_admin:{
          type:Number,
          required:true
        },
         is_verified:{
        type:Number,
        default:0
        },
        is_blocked:{
          type:Boolean,
          default:false
        },
        referenceCode:{
          type:String
        },
        referedCode:{
          type:String
        },
        coupons: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Coupon'
      }]
  
  
  },{
    timestamps:true
  });

module.exports=mongoose.model('User',userSchema);
