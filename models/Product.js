import mongoose from "mongoose";

/* ================= INGREDIENT ================= */

const IngredientSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  unit: String,
  percent: Number,
});

/* ================= VARIANT ================= */

const VariantSchema = new mongoose.Schema({
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

  barcode: String,
  qrCode: String,
});

/* ================= NUTRITION ================= */

const NutritionSchema = new mongoose.Schema({
  energy: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
});

/* ================= AI CONTENT ================= */

const AIContentSchema = new mongoose.Schema({
  title: String,
  description: String,
  highlights: [String],
  seoKeywords: [String],
  videoScript: String,

  // 🔥 FUTURE: AI VIDEO GENERATOR SUPPORT
  video: {
    status: {
      type: String,
      enum: ["pending", "processing", "generated", "failed"],
      default: "pending",
    },
    url: String,
    thumbnail: String,
    provider: String, // runway / heygen / custom
    prompt: String,
  },
});

/* ================= MAIN PRODUCT ================= */

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
      unique: true,
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

    /* ================= CONTENT ================= */

    description: String,
    shortDescription: String,

    ingredients: [IngredientSchema],

    shelfLife: String,

    /* ================= LEGAL ================= */

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

    /* ================= VARIANTS (IMPORTANT FIX) ================= */

    variants: {
      type: [VariantSchema],
      default: [],
    },

    /* ================= PRIMARY VARIANT (FIX YOUR ERROR SOURCE) ================= */

    variant: {
      sku: {
        type: String,
        required: true,
      },
      value: String,
      unit: String,
      mrp: Number,
      sellingPrice: Number,
      stock: Number,
      barcode: String,
      qrCode: String,
    },

    /* ================= IDS ================= */

    productId: {
      type: String,
      index: true,
    },

    barcode: String,
    qrCode: String,

    /* ================= PRICING ================= */

    pricing: {
      mrp: Number,
      sellingPrice: Number,
      priceWithGST: Number,
      baseCost: Number,
      packagingCost: Number,
      logisticsCost: Number,
      marketingCost: Number,
    },

    /* ================= NUTRITION ================= */

    nutrition: NutritionSchema,

    /* ================= SEO ================= */

    seo: {
      title: String,
      description: String,
      keywords: String,
    },

    tags: String,

    /* ================= AI ================= */

    ai: AIContentSchema,

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

    isListed: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    /* ================= TRACKING ================= */

    createdBy: String,
    updatedBy: String,
    approvedBy: String,
    deletedBy: String,

    approvedAt: Date,
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
