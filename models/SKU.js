import mongoose from "mongoose"

const schema = new mongoose.Schema({

  productId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Product"
  },

  skuCode:String,
  partCode:String,
  price:Number

},{timestamps:true})

const SKU =
  mongoose.models.SKU ||
  mongoose.model("SKU", schema)

export default SKU
