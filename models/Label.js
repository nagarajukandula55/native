import mongoose from "mongoose";

const LabelSchema = new mongoose.Schema({
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
  qrCodeUrl: String,       // QR linking to product page
  barcodeUrl: String,      // Barcode image
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Label || mongoose.model("Label", LabelSchema);
