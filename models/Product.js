import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    slug: { type: String, required: true, unique: true },

    sku: { type: String, required: true, unique: true },

    description: String,

    brand: String,

    category: String,

    images: [String], // ✅ MULTIPLE IMAGES

    price: { type: Number, required: true }, // selling price
    mrp: Number,
    costPrice: Number,

    hsn: String,
    gst: Number,

    weight: Number,
    length: Number,
    breadth: Number,
    height: Number,

    featured: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
