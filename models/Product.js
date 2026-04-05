import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  name: String,        // e.g., Size, Flavor
  options: [String],   // e.g., ["Small", "Medium", "Large"]
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    mrp: { type: Number, required: true },
    profit: { type: Number },
    images: [{ type: String }], // Cloudinary URLs
    variants: [variantSchema],
    gstCategory: {
      type: String,
      enum: ["Food", "Electronics", "Other"], // Add more as needed
    },
    hsn: String,
    gstPercent: Number,
    websiteCategory: String, // Admin-customizable
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    seoTitle: String,
    seoDescription: String,
    tags: [String],
  },
  { timestamps: true }
);

// Auto calculate profit before save
productSchema.pre("save", function () {
  this.profit = this.sellingPrice - this.costPrice;
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
