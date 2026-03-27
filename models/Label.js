import mongoose from "mongoose";

const LabelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String },
  size: { type: String },
  quality: { type: String },
  price: { type: Number, default: 0 },
  description: { type: String },
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
  },
}, { timestamps: true });

export default mongoose.models.Label || mongoose.model("Label", LabelSchema);
