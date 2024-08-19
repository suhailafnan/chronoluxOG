const mongoose=require("mongoose");
const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
      },

     Description:{
        type:String,
        required:true

     },
     is_listed:{
        type:Boolean,
        default:true
     },
     orderCount:{
      type:Number,
      default:0
     }
  
  },{
   timestamps:true
 });

module.exports=mongoose.model('category',categorySchema);