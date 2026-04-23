import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  stock: { type: Number, default: 0 },
  warehouse: { type: String, default: "Main Warehouse" },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Inventory ||
  mongoose.model("Inventory", inventorySchema);
