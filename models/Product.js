import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    price: Number,
    description: String,
    category: String,
    stock: Number,
    featured: Boolean,
    image: String
  },
  { timestamps: true }
)

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema)
