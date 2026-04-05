import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    brand: { type: String },

    gstCategory: { type: String, required: true }, // FOOD, ELECTRONICS etc
    productCategory: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory" },

    description: { type: String },

    mrp: { type: Number, required: true },
    price: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    profit: { type: Number },

    images: [{ type: String }],
    thumbnail: { type: String }, // first image as thumbnail

    sku: { type: String, unique: true },
    reorderLevel: { type: Number, default: 0 },

    hsn: { type: String },
    gst: { type: Number },

    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: { type: String },

    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

ProductSchema.pre("save", function (next) {
  this.profit = this.price - this.costPrice;

  // Auto HSN & GST based on GST Category
  if (this.gstCategory) {
    switch (this.gstCategory.toUpperCase()) {
      case "FOOD":
        this.hsn = "2106";
        this.gst = 5;
        break;
      case "ELECTRONICS":
        this.hsn = "8517";
        this.gst = 18;
        break;
      default:
        this.hsn = "9999";
        this.gst = 12;
    }
  }

  // Auto SEO
  if (!this.metaTitle) this.metaTitle = `${this.name} | Buy Online`;
  if (!this.metaDescription)
    this.metaDescription = `${this.name} available at best price. ${this.description.slice(0, 100)}`;
  if (!this.keywords) this.keywords = `${this.name}, ${this.productCategory}`;

  if (this.images && this.images.length > 0 && !this.thumbnail) this.thumbnail = this.images[0];

  next();
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
