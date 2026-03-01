import mongoose from "mongoose";
const schema=new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
  items:Array,
  totalPrice:Number,
  status:{type:String,default:"Pending"}
},{timestamps:true});
export default mongoose.model("Order",schema);