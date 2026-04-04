import mongoose from "mongoose"

const InventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
      index: true,
    },

    // 📦 STOCK STATES
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

    // 📊 SYSTEM CHECK
    totalQty: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ⚠️ Alerts
    reorderLevel: {
      type: Number,
      default: 0,
    },

    // 🔍 Tracking
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

/* =========================
   🔒 UNIQUE CONSTRAINT
========================= */

InventorySchema.index(
  { product: 1, warehouse: 1 },
  { unique: true }
)

/* =========================
   ⚡ DATA CONSISTENCY HOOK
========================= */

InventorySchema.pre("save", function (next) {
  // Ensure totalQty always matches
  this.totalQty =
    this.availableQty +
    this.reservedQty +
    this.shippedQty

  next()
})

/* =========================
   ⚡ INDEXES
========================= */

InventorySchema.index({ product: 1 })
InventorySchema.index({ warehouse: 1 })

export default mongoose.models.Inventory ||
  mongoose.model("Inventory", InventorySchema)
