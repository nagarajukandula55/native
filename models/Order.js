import mongoose from "mongoose"

/* ================= STATUS HISTORY ================= */

const StatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "Order Placed",
        "Packed",
        "Shipped",
        "Out For Delivery",
        "Delivered",
        "Cancelled"
      ]
    },
    time: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
)

/* ================= ITEMS ================= */

const OrderItemSchema = new mongoose.Schema(
  {
    productId: String,

    name: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    quantity: {
      type: Number,
      required: true
    }
  },
  { _id: false }
)

/* ================= MAIN ORDER ================= */

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    customerName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true
    },

    email: {
      type: String,
      default: ""
    },

    address: {
      type: String,
      required: true
    },

    pincode: {
      type: String,
      required: true
    },

    items: [OrderItemSchema],

    totalAmount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: [
        "Order Placed",
        "Packed",
        "Shipped",
        "Out For Delivery",
        "Delivered",
        "Cancelled"
      ],
      default: "Order Placed"
    },

    /* ⭐ TIMELINE TRACKING */
    statusHistory: {
      type: [StatusHistorySchema],
      default: [
        {
          status: "Order Placed",
          time: new Date()
        }
      ]
    },

    /* 🔥 NEW: COURIER SYSTEM */
    awbNumber: {
      type: String,
      default: ""
    },

    courierName: {
      type: String,
      default: ""
    },

    trackingUrl: {
      type: String,
      default: ""
    },

    /* 💰 PAYMENT */
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },

    paymentId: {
      type: String,
      default: ""
    }

  },
  {
    timestamps: true,
    collection: "orders"
  }
)

/* ================= EXPORT ================= */

const Order =
  mongoose.models.Order ||
  mongoose.model("Order", OrderSchema)

export default Order
