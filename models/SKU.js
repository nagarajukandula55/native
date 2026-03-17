import mongoose from "mongoose"

const SKUSchema = new mongoose.Schema({

  productId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Product",
    required:true
  },

  skuCode:{
    type:String,
    required:true
  },

  partCode:{
    type:String,
    required:true
  },

  price:{
    type:Number,
    default:0
  }

},{timestamps:true})

export default mongoose.models.SKU ||
mongoose.model("SKU",SKUSchema)
