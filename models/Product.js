import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  type: { type: String, required: true },
  value: { type: String, required: true },

  sku: { type: String, required: true },

  costPrice: Number,
  mrp: Number,
  sellingPrice: Number,

  stock: { type: Number, default: 0 },

  images: [String],

  isActive: { type: Boolean, default: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    sku: { type: String, unique: true },

    description: String,
    brand: String,

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },

    gstCategory: { type: mongoose.Schema.Types.ObjectId, ref: "GstCategory" },
    hsnCode: String,
    gstPercent: Number,

    costPrice: Number,
    mrp: Number,
    sellingPrice: Number,

    discount: Number,
    profit: Number,

    images: [String],

    variants: [variantSchema],

    totalStock: Number,
    lowStockAlert: Number,
    trackInventory: { type: Boolean, default: true },
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

    tags: [String],

    isFeatured: Boolean,
    isBestSeller: Boolean,
    isNewArrival: Boolean,

    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    isDeleted: { type: Boolean, default: false },
    publishedAt: Date,

    status: {
      type: String,
      enum: ["active", "inactive", "draft", "out_of_stock"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);
