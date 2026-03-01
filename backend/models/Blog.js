import mongoose from "mongoose";
const schema=new mongoose.Schema({
  title:String,
  content:String,
  image:String,
  author:String
},{timestamps:true});
export default mongoose.model("Blog",schema);