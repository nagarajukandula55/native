import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    slug: { type: String, unique: true },

    sku: { type: String, unique: true, required: true },

    brand: String,

    shortDescription: String,
    description: String,

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    gstCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    mrp: Number,
    sellingPrice: Number,
    costPrice: Number,

    discountPercent: Number,
    profitMargin: Number,

    hsnCode: String,
    gstPercent: Number,

    images: [String],
    featuredImage: String,

    attributes: {
      weight: Number,
      length: Number,
      breadth: Number,
      height: Number,
    },

    seoTitle: String,
    seoDescription: String,

    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },

    approved: { type: Boolean, default: false },

    createdBy: String,
  },
  { timestamps: true }
);

/* 🔥 AUTO LOGIC */
productSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
  }

  if (this.mrp && this.sellingPrice) {
    this.discountPercent =
      ((this.mrp - this.sellingPrice) / this.mrp) * 100;
  }

  if (this.costPrice && this.sellingPrice) {
    this.profitMargin = this.sellingPrice - this.costPrice;
  }

  this.seoTitle = this.name;
  this.seoDescription = this.shortDescription || this.description?.slice(0, 120);

  next();
});

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
