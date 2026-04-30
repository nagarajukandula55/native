import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: String,
  name: String,
  image: String,
  price: Number,
  qty: Number,
});

const WarehouseSchema = new mongoose.Schema({
  status: {
    type: String,
    default: "NEW",
    enum: ["NEW", "PICKING", "PACKED", "DISPATCHED"],
  },
  assignedTo: String,
  packedAt: Date,
  dispatchedAt: Date,
});

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },

    orderId: {
      type: String,
      required: true,
      index: true,   // 🔥 IMPORTANT FIX
    },

    items: [OrderItemSchema],

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      default: "PENDING_PAYMENT",
      enum: [
        "PENDING_PAYMENT",
        "PAID",
        "PROCESSING",
        "PACKED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "FAILED",
      ],
    },

    payment: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
      method: String,
      paidAt: Date,
    },

    address: {
      name: String,
      phone: String,
      address: String,
      city: String,
      pincode: String,
    },

    warehouse: {
      type: WarehouseSchema,
      default: {
        status: "NEW",
        assignedTo: null,
      },
    },
  },
  { timestamps: true }
);

// 🔥 CRITICAL SAFE EXPORT
const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
