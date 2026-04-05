import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, // Website category
    gstCategory: { type: String, required: true }, // Food/GST category
    hsnCode: { type: String, required: true },
    gstPercent: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    mrp: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    tags: [{ type: String }],
    images: [{ type: String }], // cloudinary urls
    featuredImage: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);
