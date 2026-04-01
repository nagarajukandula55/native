import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    availableQty: { type: Number, default: 0 },
    reservedQty: { type: Number, default: 0 },
    shippedQty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* ✅ FIX: UNIQUE INDEX */
InventorySchema.index({ productId: 1, warehouseId: 1 }, { unique: true });

export default mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);
