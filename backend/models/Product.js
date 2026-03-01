import mongoose from "mongoose";
const schema=new mongoose.Schema({
  title:String,
  description:String,
  price:Number,
  stock:Number,
  image:String,
  category:String
},{timestamps:true});
export default mongoose.model("Product",schema);