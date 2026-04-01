import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
      index: true,
    },

    availableQty: {
      type: Number,
      default: 0,
      min: 0,
    },

    reservedQty: {
      type: Number,
      default: 0,
      min: 0,
    },

    shippedQty: {
      type: Number,
      default: 0,
      min: 0,
    },

    damagedQty: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalQty: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* ✅ UNIQUE COMBINATION */
InventorySchema.index(
  { productId: 1, warehouseId: 1 },
  { unique: true }
);

/* ✅ AUTO TOTAL CALCULATION */
InventorySchema.pre("save", function (next) {
  this.totalQty =
    (this.availableQty || 0) +
    (this.reservedQty || 0) +
    (this.shippedQty || 0) +
    (this.damagedQty || 0);

  next();
});

export default mongoose.models.Inventory ||
  mongoose.model("Inventory", InventorySchema);
