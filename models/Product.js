import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    sku: { type: String, unique: true },

    description: String,
    brand: String,

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },

    gstCategory: { type: mongoose.Schema.Types.ObjectId, ref: "GstCategory" },
    hsnCode: String,
    gstPercent: Number,

    costPrice: Number,
    mrp: Number,
    sellingPrice: Number,

    images: [String],

    tags: [String],

    status: {
      type: String,
      enum: ["active", "inactive", "draft", "out_of_stock"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);
