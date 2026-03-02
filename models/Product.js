import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  description: { type: String, default: "" },
  visible: { type: Boolean, default: true },
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
