import mongoose from "mongoose"

/* =========================
   📦 ORDER ITEM SCHEMA
========================= */

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
)

/* =========================
   🧾 ORDER SCHEMA
========================= */

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // 👤 CUSTOMER
    customerName: String,
    phone: String,
    email: String,

    address: String,
    pincode: String,

    // 🛒 ITEMS
    items: [OrderItemSchema],

    totalAmount: {
      type: Number,
      required: true,
    },

    // 🏭 WAREHOUSE (STORE)
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
      index: true,
    },

    // 📦 ORDER STATUS
    status: {
      type: String,
      enum: [
        "PLACED",
        "CONFIRMED",
        "PACKED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
      index: true,
    },

    // 💳 PAYMENT
    paymentMethod: {
      type: String,
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    // 🚚 SHIPPING
    awbNumber: String,
    courierName: String,
    trackingUrl: String,

    // 📜 STATUS HISTORY
    statusHistory: [
      {
        status: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

/* =========================
   ⚡ INDEXES
========================= */

OrderSchema.index({ orderId: 1 })
OrderSchema.index({ warehouse: 1, status: 1 })
OrderSchema.index({ createdAt: -1 })

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema)
