import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  image: { type: String, default: "" },   // URL from Cloudinary
  alt: { type: String, default: "" },     // optional alt text for images
  category: { type: String, default: "General" }, // future category
  stock: { type: Number, default: 100 },  // stock count
  featured: { type: Boolean, default: false }, // for homepage highlight
  slug: { type: String, unique: true },    // SEO friendly
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
