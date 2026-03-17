import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  mrp: { type: Number },
  costPrice: { type: Number },
  category: { type: String },
  brand: { type: String },
  stock: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 0 },
  hsn: { type: String },
  gst: { type: Number },
  weight: { type: Number },
  length: { type: Number },
  breadth: { type: Number },
  height: { type: Number },
  featured: { type: Boolean, default: false },
  status: { type: String, default: "ACTIVE" },
  image: { type: String },
  alt: { type: String },
}, { timestamps: true })

export default mongoose.models.Product || mongoose.model("Product", ProductSchema)
