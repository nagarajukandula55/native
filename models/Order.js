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
    time: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* ================= ORDER ================= */
const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    address: { type: String, required: true },
    pincode: { type: String, required: true },

    items: [
      {
        productId: String,
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],

    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["Order Placed", "Packed", "Shipped", "Out For Delivery", "Delivered", "Cancelled"],
      default: "Order Placed",
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: [{ status: "Order Placed", time: new Date() }],
    },

    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    paymentMethod: { type: String, enum: ["COD", "UPI", "RAZORPAY", "WHATSAPP"], default: "COD" },
    paymentId: { type: String, default: "" },
    razorpayOrderId: { type: String, default: "" },

    awb: { type: String, default: "" },
    courierName: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },

    warehouseAssignments: [
      {
        warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
        assignedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, collection: "orders" }
);

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export default Order;
