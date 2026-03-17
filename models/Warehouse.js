import mongoose from "mongoose"

const schema = new mongoose.Schema({

  name:{ type:String, required:true },

  code:{ type:String, required:true, unique:true },

  type:{
    type:String,
    default:"Main"
  },

  address:String,
  city:String,
  state:String,
  pincode:String,
  country:{ type:String, default:"India" },

  managerName:String,
  phone:String,
  email:String,

  capacity:Number,

  isActive:{ type:Boolean, default:true },

  allowDispatch:{ type:Boolean, default:true },

  allowPurchase:{ type:Boolean, default:true },

  priority:{ type:Number, default:1 }

},{timestamps:true})

const Warehouse =
  mongoose.models.Warehouse ||
  mongoose.model("Warehouse", schema)

export default Warehouse
