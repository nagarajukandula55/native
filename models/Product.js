import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    sku: { type: String, unique: true },
    description: String,
    category: String,
    brand: String,
    price: Number,
    mrp: Number,
    costPrice: Number,
    stock: Number,
    reorderLevel: Number,
    hsn: String,
    gst: Number,
    weight: Number,
    length: Number,
    breadth: Number,
    height: Number,
    featured: { type: Boolean, default: false },
    status: { type: String, default: "ACTIVE" },
    image: String,
    alt: String,
  },
  { timestamps: true }
)

export default mongoose.models.Product || mongoose.model("Product", ProductSchema)
