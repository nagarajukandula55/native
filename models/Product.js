import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  mrp: { type: Number, default: 0 },
  costPrice: { type: Number, default: 0 },
  brand: { type: String, default: "" },
  stock: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 0 },
  hsn: { type: String, default: "" },
  gst: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  length: { type: Number, default: 0 },
  breadth: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  createdAt: { type: Date, default: Date.now }
})

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema)
export default Product
