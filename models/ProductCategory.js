import mongoose from "mongoose";

const ProductCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    gstCategory: { type: String, required: true }, // links to GST category
  },
  { timestamps: true }
);

export default mongoose.models.ProductCategory ||
  mongoose.model("ProductCategory", ProductCategorySchema);
