import mongoose from "mongoose";

const SKUSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    price: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const SKU =
  mongoose.models.SKU || mongoose.model("SKU", SKUSchema);

export default SKU;
