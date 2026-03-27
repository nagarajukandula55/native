import mongoose from "mongoose";

const LabelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  sku: { type: String, required: true },
  size: { type: String, enum: ["Small", "Medium", "Large"], default: "Medium" },
  quality: { type: String, enum: ["Standard", "Premium"], default: "Standard" },
  nutrition: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
  },
  price: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Label || mongoose.model("Label", LabelSchema);
