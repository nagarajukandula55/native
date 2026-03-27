import mongoose from "mongoose";

const LabelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true },
    size: String,
    quality: String,
    price: Number,
    nutrition: {
      calories: Number,
      protein: Number,
      fat: Number,
      carbs: Number,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "labels" }
);

export default mongoose.models.Label || mongoose.model("Label", LabelSchema);
