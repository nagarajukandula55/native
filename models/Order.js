import mongoose from "mongoose";

/* ================= ITEM ================= */
const OrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productKey: String,
    image: String,

    price: { type: Number, required: true },
    qty: { type: Number, required: true },

    gstPercent: Number,
    baseAmount: Number,
    total: Number,
  },
  { _id: false }
);

/* ================= ORDER ================= */
const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, index: true },

    items: { type: [OrderItemSchema], required: true },

    amount: { type: Number, required: true },

    status: {
      type: String,
      default: "PENDING_PAYMENT",
    },

    address: {
      name: String,
      phone: String,
      email: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      gstNumber: String,
    },

    payment: {
      method: String,
      paidAt: Date,
    },
  },
  {
    timestamps: true,
    strict: true, // ✅ SAFE but not crashing
  }
);

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);
