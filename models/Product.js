import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },

    productKey: { type: String, index: true },

    category: String,

    /* GST */
    gstCategory: String,
    gstDescription: String,
    hsn: String,
    tax: Number,

    /* Pricing */
    mrp: Number,
    sellingPrice: Number,

    /* Variant */
    variant: String, // 250GM
    variantType: String,

    /* SKU */
    sku: { type: String, unique: true },

    /* Content */
    description: String,
    shortDescription: String,
    ingredients: String,
    shelfLife: String,

    /* Media */
    images: [String],

    /* SEO */
    metaTitle: String,
    metaDescription: String,

    /* System */
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* 🔥 PREVENT DUPLICATE VARIANT */
ProductSchema.index({ productKey: 1, variant: 1 }, { unique: true });

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
