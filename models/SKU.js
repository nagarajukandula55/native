import mongoose from "mongoose";

const skuSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    skuCode: {
      type: String,
      required: true,
      unique: true,
    },

    partCode: {
      type: String,
      required: true,
      unique: true,
    },

    attributes: {
      color: String,
      size: String,
      variant: String,
    },

    mrp: Number,
    sellingPrice: Number,
    costPrice: Number,

    weight: Number,

    dimensions: {
      length: Number,
      breadth: Number,
      height: Number,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.SKU ||
  mongoose.model("SKU", skuSchema);
