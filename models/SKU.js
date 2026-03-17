import mongoose from "mongoose"

const SKUSchema = new mongoose.Schema({

  productId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Product"
  },

  skuCode:String,
  partCode:String,
  price:Number

},{timestamps:true})

export default mongoose.models.SKU ||
mongoose.model("SKU",SKUSchema)
