import mongoose from "mongoose"

const SkuSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  skuCode: { type: String, required: true, unique: true },
  partCode: { type: String },
  price: { type: Number, required: true },
  minStock: { type: Number, default: 0 },
  maxStock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.Sku || mongoose.model("Sku", SkuSchema)
