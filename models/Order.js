import mongoose from "mongoose"

const OrderSchema = new mongoose.Schema({

  orderId:{
    type:String,
    required:true,
    unique:true,
    index:true   // ⭐ fast tracking search
  },

  customerName:{
    type:String,
    required:true,
    trim:true
  },

  phone:{
    type:String,
    required:true
  },

  email:{
    type:String,
    default:""
  },

  address:{
    type:String,
    required:true
  },

  pincode:{
    type:String,
    required:true
  },

  items:[
    {
      productId:String,

      name:{
        type:String,
        required:true
      },

      price:{
        type:Number,
        required:true
      },

      quantity:{
        type:Number,
        required:true
      }
    }
  ],

  totalAmount:{
    type:Number,
    required:true
  },

  status:{
    type:String,
    enum:[
      "Order Placed",
      "Packed",
      "Shipped",
      "Out For Delivery",
      "Delivered",
      "Cancelled"
    ],
    default:"Order Placed"
  }

},{
  timestamps:true   // ⭐ auto createdAt + updatedAt
})

export default mongoose.models.Order ||
mongoose.model("Order",OrderSchema)
