import mongoose from "mongoose"

const WarehouseSchema = new mongoose.Schema({
  name:String,
  location:String
},{timestamps:true})

export default mongoose.models.Warehouse ||
mongoose.model("Warehouse",WarehouseSchema)
