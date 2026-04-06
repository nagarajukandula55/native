import mongoose from "mongoose";

/* ================= VARIANT SCHEMA ================= */
const variantSchema = new mongoose.Schema(
  {
    type: { type: String, default: "" },     // e.g. Weight, Size
    value: { type: String, default: "" },    // e.g. 500g, 1kg

    cost: { type: Number, default: 0 },
    price: { type: Number, default: 0 },

    stock: { type: Number, default: 0 },

    sku: { type: String, default: "" },
  },
  { _id: false }
);

/* ================= PRODUCT SCHEMA ================= */
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    slug: { type: String, unique: true },
    sku: { type: String, unique: true },

    description: { type: String, default: "" },
    brand: { type: String, default: "" },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
    },

    gstCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GstCategory",
    },
    hsnCode: { type: String, default: "" },
    gstPercent: { type: Number, default: 0 },

    /* ===== PRICING ===== */
    costPrice: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },

    /* ===== INVENTORY ===== */
    stock: { type: Number, default: 0 }, // product-level stock

    /* ===== VARIANTS ===== */
    variants: {
      type: [variantSchema],
      default: [],
    },

    /* ===== MEDIA ===== */
    images: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    /* ===== STATUS ===== */
    status: {
      type: String,
      enum: ["active", "inactive", "draft", "out_of_stock"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
