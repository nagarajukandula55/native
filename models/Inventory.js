import mongoose from "mongoose"

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

  qty: {
    type: Number,
    default: 0
  }

}, { timestamps: true })

// ⭐ Important → one SKU per warehouse
InventorySchema.index(
  { skuId: 1, warehouseId: 1 },
  { unique: true }
)

export default mongoose.models.Inventory ||
mongoose.model("Inventory", InventorySchema)
