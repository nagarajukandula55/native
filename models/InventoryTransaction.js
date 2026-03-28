import mongoose from "mongoose";

const InventoryTransactionSchema = new mongoose.Schema({
  skuId: { type: mongoose.Schema.Types.ObjectId, ref: "SKU" },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },

  type: {
    type: String,
    enum: ["RESERVE", "RELEASE", "SHIP", "RETURN"],
  },

  qty: Number,

  note: String,

}, { timestamps: true });

export default mongoose.models.InventoryTransaction ||
mongoose.model("InventoryTransaction", InventoryTransactionSchema);
