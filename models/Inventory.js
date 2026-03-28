import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    /* ================= PRODUCT ================= */
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // ✅ FIXED (was SKU)
      required: true,
    },

    /* ================= WAREHOUSE ================= */
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    /* ================= STOCK BUCKETS ================= */

    // 🟢 Ready to sell
    availableQty: {
      type: Number,
      default: 0,
    },

    // 🟡 Reserved for orders (assigned but not packed)
    reservedQty: {
      type: Number,
      default: 0,
    },

    // 🔵 Packed / shipped (in transit)
    shippedQty: {
      type: Number,
      default: 0,
    },

    /* ================= TOTAL ================= */
    totalQty: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* ================= UNIQUE INDEX ================= */
InventorySchema.index(
  { productId: 1, warehouseId: 1 },
  { unique: true }
);

/* ================= AUTO TOTAL ================= */
InventorySchema.pre("save", function (next) {
  this.totalQty =
    (this.availableQty || 0) +
    (this.reservedQty || 0) +
    (this.shippedQty || 0);

  next();
});

export default mongoose.models.Inventory ||
  mongoose.model("Inventory", InventorySchema);
