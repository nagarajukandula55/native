import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    brand: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    mrp: {
      type: Number,
      default: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
    },

    hsn: {
      type: String,
      required: true,
    },

    gst: {
      type: Number,
      required: true,
      min: 0,
    },

    weight: {
      type: Number,
      default: 0,
    },

    dimensions: {
      length: { type: Number, default: 0 },
      breadth: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },

    image: {
      type: String,
      default: "",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
  },
  { timestamps: true }
)

// 🔥 Indexes for performance
ProductSchema.index({ name: "text", brand: "text" })

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema)
