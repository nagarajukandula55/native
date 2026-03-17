import mongoose from "mongoose";

const txnSchema = new mongoose.Schema(
  {
    skuId: mongoose.Schema.Types.ObjectId,
    warehouseId: mongoose.Schema.Types.ObjectId,

    type: {
      type: String,
      enum: [
        "PURCHASE",
        "RESERVE",
        "DEDUCT",
        "RETURN",
        "TRANSFER_OUT",
        "TRANSFER_IN",
        "ADJUSTMENT",
      ],
    },

    quantity: Number,

    referenceType: String,
    referenceId: mongoose.Schema.Types.ObjectId,

    createdBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

export default mongoose.models.InventoryTxn ||
  mongoose.model("InventoryTxn", txnSchema);
