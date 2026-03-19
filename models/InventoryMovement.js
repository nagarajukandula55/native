import mongoose from "mongoose";

const InventoryMovementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    quantity: { type: Number, required: true },
    type: { type: String, enum: ["IN", "OUT"], required: true }, // IN for stock added, OUT for stock deducted
    notes: { type: String },
  },
  { timestamps: true }
);

const InventoryMovement =
  mongoose.models.InventoryMovement ||
  mongoose.model("InventoryMovement", inventoryMovementSchema);

export default InventoryMovement;
