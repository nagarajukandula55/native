import mongoose from "mongoose";

const SkuSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  partCode: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Sku || mongoose.model("Sku", SkuSchema);
