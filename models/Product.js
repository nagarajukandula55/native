import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    /* ================= CORE ================= */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      index: true,
    },

    productKey: {
      type: String,
      required: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    /* ================= GST ================= */

    gstCategory: String,
    gstDescription: String,
    hsn: String,

    tax: {
      type: Number,
      default: 0,
    },

    /* ================= PRODUCT CONTENT ================= */

    description: String,
    shortDescription: String,
    ingredients: String,
    shelfLife: String,

    /* ================= LEGAL / FSSAI ================= */

    manufacturerName: String,

    manufacturerAddress: String,

    fssaiLicense: {
      type: String,
      index: true,
    },

    countryOfOrigin: {
      type: String,
      default: "India",
    },

    packedDate: Date,
    expiryDate: Date,

    storageInstructions: String,
    allergenInfo: String,

    /* ================= MEDIA ================= */

    images: {
      type: [String],
      default: [],
    },

    /* ================= VARIANT LEVEL (PER DOC) ================= */

    variant: {
      type: String, // e.g. 500GM
      required: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    mrp: {
      type: Number,
      required: true,
    },

    sellingPrice: {
      type: Number,
      required: true,
    },

    /* ================= NUTRITION ================= */

    nutrition: [
      {
        ingredient: String,
        ratio: Number,

        // calculated values
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
      },
    ],

    /* ================= SEO ================= */

    seo: {
      title: String,
      description: String,
      keywords: String,
    },

    /* ================= STATUS FLOW ================= */

    status: {
      type: String,
      enum: ["draft", "review", "approved", "rejected"],
      default: "draft",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* ================= META ================= */

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // auto createdAt & updatedAt
  }
);

/* ================= SAFE EXPORT ================= */

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
