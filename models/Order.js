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

  assignedTo: {
    type: String,
    default: null,
  },

  packedAt: Date,
  dispatchedAt: Date,
});

const OrderSchema = new mongoose.Schema(
  {
    /* ================= USER ================= */
    userId: { type: String, default: null },

    /* ================= ORDER ================= */
    orderId: {
      type: String,
      unique: true,
    },

    items: [OrderItemSchema],

    amount: {
      type: Number,
      required: true,
    },

    /* ================= ORDER STATUS ================= */
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

    /* ================= PAYMENT ================= */
    payment: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
      method: String,
      paidAt: Date,
    },

    /* ================= ADDRESS ================= */
    address: {
      name: String,
      phone: String,
      address: String,
      city: String,
      pincode: String,
    },

    /* ================= 🏭 WAREHOUSE MODULE ================= */
    warehouse: {
      type: WarehouseSchema,
      default: () => ({
        status: "NEW",
        assignedTo: null,
      }),
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);
