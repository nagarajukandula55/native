import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema({

  name: { type: String, required: true },

  description: String,

  category: String,

  brand: String,

  slug: String,

  image: String,
  alt: String,

  mrp: Number,
  price: Number,
  costPrice: Number,

  stock: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 5 },

  hsn: String,
  gst: Number,

  weight: Number,
  length: Number,
  breadth: Number,
  height: Number,

  featured: { type: Boolean, default: false },

  status: {
    type: String,
    default: "ACTIVE"
  }

}, { timestamps: true })

export default mongoose.models.Product ||
mongoose.model("Product", ProductSchema)
