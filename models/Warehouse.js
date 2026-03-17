import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema(
  {
    warehouseCode: {
      type: String,
      required: true,
      unique: true,
    },

    warehouseName: String,

    address: String,
    city: String,
    state: String,
    pincode: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Warehouse ||
  mongoose.model("Warehouse", warehouseSchema);
