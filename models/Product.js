import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  type: String,
  value: String,
  sku: String,

  costPrice: Number,
  mrp: Number,
  sellingPrice: Number,

  stock: Number,
  images: [String],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: String,
    sku: { type: String, unique: true },

    description: String,
    brand: String,

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },

    gstCategory: { type: mongoose.Schema.Types.ObjectId, ref: "GstCategory" },
    hsnCode: String,
    gstPercent: Number,
    taxIncluded: Boolean,

    costPrice: Number,
    mrp: Number,
    sellingPrice: Number,
    profit: Number,

    variants: [variantSchema],

    totalStock: Number,
    lowStockAlert: Number,
    trackInventory: Boolean,
    allowBackorder: Boolean,

    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },

    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],

    isFeatured: Boolean,
    isBestSeller: Boolean,
    isNewArrival: Boolean,

    images: [String],

    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);
