import mongoose from "mongoose"

const WarehouseSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  location:{
    type:String,
    default:""
  }
},{timestamps:true})

export default mongoose.models.Warehouse ||
mongoose.model("Warehouse",WarehouseSchema)
