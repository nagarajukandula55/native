import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  productKey: String,
  category: String,

  variant: String,
  sku: String,

  mrp: Number,
  sellingPrice: Number,

  images: [String],

  description: String,
  shortDescription: String,
  ingredients: String,
  shelfLife: String,

  seo: Object,

  status: {
    type: String,
    default: "review",
  },

  isActive: {
    type: Boolean,
    default: false,
  },

  createdAt: Date,
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
