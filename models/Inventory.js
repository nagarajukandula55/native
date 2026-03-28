import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true
  },

  availableQty: { type: Number, default: 0 },
  reservedQty: { type: Number, default: 0 },
  shippedQty: { type: Number, default: 0 },

  totalQty: { type: Number, default: 0 }

}, { timestamps: true });

InventorySchema.index(
  { productId: 1, warehouseId: 1 },
  { unique: true }
);

InventorySchema.pre("save", function (next) {
  this.totalQty =
    (this.availableQty || 0) +
    (this.reservedQty || 0) +
    (this.shippedQty || 0);

  next();
});

export default mongoose.models.Inventory ||
mongoose.model("Inventory", InventorySchema);
