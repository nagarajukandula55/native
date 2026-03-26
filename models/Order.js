import mongoose from "mongoose";

/* ================= STATUS ENUM ================= */
const ORDER_STATUS = [
  "Order Placed",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
  "Cancelled",
];

/* ================= STATUS HISTORY ================= */
const StatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ORDER_STATUS,
      required: true,
    },
    time: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: false }
);

/* ================= ITEMS ================= */
const ItemSchema = new mongoose.Schema(
  {
    productId: String,
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

/* ================= ORDER ================= */
const OrderSchema = new mongoose.Schema(
  {
    /* ===== ORDER ID ===== */
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /* ===== CUSTOMER INFO ===== */
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    address: { type: String, required: true },
    pincode: { type: String, required: true },

    /* ===== ITEMS ===== */
    items: {
      type: [ItemSchema],
      required: true,
    },

    totalAmount: { type: Number, required: true },

    /* ===== ORDER STATUS ===== */
    status: {
      type: String,
      enum: ORDER_STATUS,
      default: "Order Placed",
      index: true,
    },

    statusHistory: {
      type: [StatusHistorySchema],
      default: function () {
        return [
          {
            status: "Order Placed",
            time: new Date(),
          },
        ];
      },
    },

    /* ===== STORE ASSIGNMENT (🔥 IMPORTANT) ===== */
    assignedStore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    /* ===== PAYMENT ===== */
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "RAZORPAY", "WHATSAPP"],
      default: "COD",
    },

    paymentId: { type: String, default: "" },
    razorpayOrderId: { type: String, default: "" },

    /* ===== COURIER INFO ===== */
    awbNumber: { type: String, default: "" },
    courierName: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },

    /* ===== WAREHOUSE SUPPORT (FUTURE READY) ===== */
    warehouseAssignments: [
      {
        warehouseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Warehouse",
        },
        assignedAt: { type: Date, default: Date.now },
      },
    ],

    /* ===== FLAGS ===== */
    isDeleted: { type: Boolean, default: false },
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
