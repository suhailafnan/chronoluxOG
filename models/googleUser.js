const mongoose=require("mongoose");
const googleUserSchema = new mongoose.Schema({
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
        }
  
  },{
    timestamps:true
  });

module.exports=mongoose.model('googleUser',googleUserSchema);