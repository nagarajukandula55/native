import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    image: String,
    alt: String,
    category: String,
    stock: Number,
    featured: Boolean,
    slug: { type: String, unique: true }
  },
  { timestamps: true }
)

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema)
