import mongoose from "mongoose";

/* ================= ORDER ITEM ================= */
const OrderItemSchema = new mongoose.Schema({
  productId: String,
  name: String,
  image: String,
  price: Number,
  qty: Number,
});

/* ================= WAREHOUSE ================= */
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

/* ================= RECEIPT ================= */
const ReceiptSchema = new mongoose.Schema({
  receiptNumber: String,
  generatedAt: Date,
  paymentMode: String,
  paymentReference: String,
  amountPaid: Number,
});

/* ================= INVOICE ================= */
const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  generatedAt: Date,
  invoiceUrl: String,
});

/* ================= ORDER ================= */
const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },

    orderId: {
      type: String,
      required: true,
      index: true,
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

    /* ================= PAYMENT ================= */
    payment: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
      method: String,
      paidAt: Date,
      utr: String, // 🔥 manual payment support
    },

    /* ================= RECEIPT (FIXED) ================= */
    receipt: {
      type: ReceiptSchema,
      default: null,
    },

    /* ================= INVOICE ================= */
    invoice: {
      type: InvoiceSchema,
      default: null,
    },

    invoiceHTML: {
      type: String,
      default: "",
    },

    /* ================= ADDRESS ================= */
    address: {
      name: String,
      phone: String,
      email: String, // 🔥 IMPORTANT for receipt + invoice email
      address: String,
      city: String,
      state: String,
      pincode: String,
      gstNumber: String,
    },

    /* ================= WAREHOUSE ================= */
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

/* ================= SAFE EXPORT ================= */
const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
