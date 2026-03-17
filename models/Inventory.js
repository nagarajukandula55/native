import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    skuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SKU",
      index: true,
    },

    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      index: true,
    },

    availableQty: {
      type: Number,
      default: 0,
    },

    reservedQty: {
      type: Number,
      default: 0,
    },

    damagedQty: {
      type: Number,
      default: 0,
    },

    returnedQty: {
      type: Number,
      default: 0,
    },

    reorderLevel: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

inventorySchema.index({ skuId: 1, warehouseId: 1 }, { unique: true });

export default mongoose.models.Inventory ||
  mongoose.model("Inventory", inventorySchema);
