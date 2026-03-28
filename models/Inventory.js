import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({

  skuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SKU",
    required: true
  },

  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true
  },

  /* 🔥 CORE STOCK */
  availableQty: {
    type: Number,
    default: 0
  },

  reservedQty: {
    type: Number,
    default: 0 // occupied for orders
  },

  shippedQty: {
    type: Number,
    default: 0 // dispatched
  },

  /* 🔥 DERIVED TOTAL (OPTIONAL BUT USEFUL) */
  totalQty: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

/* ⭐ UNIQUE SKU PER WAREHOUSE */
InventorySchema.index(
  { skuId: 1, warehouseId: 1 },
  { unique: true }
);

/* 🔥 AUTO CALCULATE TOTAL */
InventorySchema.pre("save", function (next) {
  this.totalQty =
    (this.availableQty || 0) +
    (this.reservedQty || 0) +
    (this.shippedQty || 0);

  next();
});

export default mongoose.models.Inventory ||
mongoose.model("Inventory", InventorySchema);
