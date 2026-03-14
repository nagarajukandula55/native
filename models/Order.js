import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({

  orderId:{
    type:String,
    required:true,
    unique:true
  },

  customerName:String,
  phone:String,
  email:String,
  address:String,
  pincode:String,

  items:[
    {
      productId:String,
      name:String,
      price:Number,
      quantity:Number
    }
  ],

  totalAmount:Number,

  status:{
    type:String,
    default:"Order Placed"
  },

  createdAt:{
    type:Date,
    default:Date.now
  }

})

export default mongoose.models.Order || mongoose.model("Order",orderSchema)
