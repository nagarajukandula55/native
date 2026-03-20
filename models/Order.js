import mongoose from "mongoose";

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
        "Cancelled",
      ],
    },
    time: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/* ================= ORDER ================= */
const OrderSchema = new mongoose.Schema(
  {
    /* BASIC INFO */
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    /* ITEMS */
    items: [
      {
        productId: String,

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    /* ORDER STATUS */
    status: {
      type: String,
      enum: [
        "Order Placed",
        "Packed",
        "Shipped",
        "Out For Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Placed",
    },

    statusHistory: {
      type: [StatusHistorySchema],
      default: [
        {
          status: "Order Placed",
          time: new Date(),
        },
      ],
    },

    /* ================= PAYMENT ================= */
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    paymentId: {
      type: String,
      default: "",
    },

    razorpayOrderId: {
      type: String,
      default: "",
    },

    /* ================= COURIER ================= */
    awbNumber: {
      type: String,
      default: "",
    },

    courierName: {
      type: String,
      default: "",
    },

    trackingUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "orders",
  }
);

/* ================= EXPORT ================= */
const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
