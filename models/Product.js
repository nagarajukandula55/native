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

    brand: String,
    subcategory: String,

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

    ingredients: [
      {
        name: String,
        qty: String,
        unit: String,
        percent: String,
      },
    ],

    shelfLife: String,

    /* ================= LEGAL / FSSAI ================= */

    fssaiNumber: String,

    manufacturerName: String,
    manufacturerAddress: String,

    countryOfOrigin: {
      type: String,
      default: "India",
    },

    batchNumber: String,

    packingDate: Date,
    expiryDate: Date,

    storageInstructions: String,
    allergenInfo: String,
    usageInstructions: String,
    safetyInfo: String,

    /* ================= MEDIA ================= */

    images: {
      type: [String],
      default: [],
    },

    primaryImage: String,

    /* ================= VARIANT ================= */

    variant: {
      value: String,
      unit: String,
      sku: {
        type: String,
        required: true,
        index: true,
      },
      mrp: Number,
      sellingPrice: Number,
      stock: Number,
    },

    productId: {
      type: String,
      index: true,
    },

    barcode: String,
    qrCode: String,

    /* ================= PRICING ================= */

    mrp: Number,
    sellingPrice: Number,
    priceWithGST: Number,

    baseCost: Number,
    packagingCost: Number,
    logisticsCost: Number,
    marketingCost: Number,

    /* ================= NUTRITION (FIXED) ================= */

    nutrition: {
      energy: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },

    /* ================= SEO ================= */

    seo: {
      title: String,
      description: String,
      keywords: String,
    },

    tags: String,

    /* ================= STATUS ================= */

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
    timestamps: true,
  }
);

/* ================= EXPORT ================= */

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
