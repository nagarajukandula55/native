import mongoose from "mongoose"

const WarehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["MAIN", "DISTRIBUTION", "STORE"],
      default: "MAIN",
      index: true,
    },

    // 📍 Location
    address: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
      index: true,
    },

    state: {
      type: String,
      default: "",
      index: true,
    },

    pincode: {
      type: String,
      default: "",
    },

    country: {
      type: String,
      default: "India",
    },

    // 👤 Manager Info
    managerName: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      lowercase: true,
      default: "",
    },

    // 📦 Capacity Planning
    capacity: {
      type: Number,
      default: 0,
    },

    // ⚙️ Operational Controls
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "MAINTENANCE"],
      default: "ACTIVE",
      index: true,
    },

    allowDispatch: {
      type: Boolean,
      default: true,
    },

    allowPurchase: {
      type: Boolean,
      default: true,
    },

    // 🚀 Priority for Order Allocation
    priority: {
      type: Number,
      default: 1,
      index: true,
    },
  },
  { timestamps: true }
)

/* =========================
   ⚡ INDEXES
========================= */

WarehouseSchema.index({ code: 1 })
WarehouseSchema.index({ city: 1, state: 1 })
WarehouseSchema.index({ status: 1, priority: 1 })

export default mongoose.models.Warehouse ||
  mongoose.model("Warehouse", WarehouseSchema)
