import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  description: String,
  visible: { type: Boolean, default: true },
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
