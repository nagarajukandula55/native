import mongoose from "mongoose";

const LabelSchema = new mongoose.Schema(
  {
    name: String,
    sku: String,
    size: String,
    quality: String,
    price: Number,
    logoUrl: String,
    greeting: String,
    nutrition: {
      calories: Number,
      protein: Number,
      fat: Number,
      carbs: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Label || mongoose.model("Label", LabelSchema);
