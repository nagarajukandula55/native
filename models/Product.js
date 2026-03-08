import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  image: { type: String, default: "" },
});

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
