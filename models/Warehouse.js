import mongoose from "mongoose"

const schema = new mongoose.Schema({
  name: String,
  location: String
},{timestamps:true})

const Warehouse =
  mongoose.models.Warehouse ||
  mongoose.model("Warehouse", schema)

export default Warehouse
