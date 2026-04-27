import mongoose from "mongoose";

const IngredientSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  unit: String,
  percent: Number,
});

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

const NutritionSchema = new mongoose.Schema({
  energy: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
});

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

    /* ================= CONTENT ================= */

    description: String,
    shortDescription: String,

    ingredients: [IngredientSchema],

    shelfLife: String,

    /* ================= COMPLIANCE ================= */

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

    /* ================= VARIANTS (FIXED STRUCTURE) ================= */

    variants: [VariantSchema],

    /* ================= IDENTIFIERS ================= */

    productId: String,

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

    seoLocal: {
      telugu: String,
      hindi: String,
    },

    /* ================= AI ================= */

    aiContent: Object,
    aiSEO: Object,

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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
