import mongoose from "mongoose";
import { safePlugin } from "@/lib/mongoose/safePlugin";

/* ================= ORDER ITEM ================= */
const OrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId, // ✅ FIXED (was String)
      ref: "Product",
    },

    productKey: String, // ✅ IMPORTANT fallback support

    name: String,
    image: String,

    price: Number,
    qty: Number,

    gstPercent: Number,
    baseAmount: Number,
    total: Number,
  },
  { _id: false }
);

/* ================= WAREHOUSE ================= */
const WarehouseSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "NEW",
      enum: ["NEW", "PICKING", "PACKED", "DISPATCHED"],
    },
    assignedTo: String,
    packedAt: Date,
    dispatchedAt: Date,
    outForDeliveryAt: Date,
    deliveredAt: Date,
  },
  { _id: false }
);

/* ================= RECEIPT ================= */
const ReceiptSchema = new mongoose.Schema(
  {
    receiptNumber: String,
    generatedAt: Date,
    paymentMode: String,
    paymentReference: String,
    amountPaid: Number,
  },
  { _id: false }
);

/* ================= INVOICE ================= */
const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: String,
    generatedAt: Date,
    invoiceUrl: String,
  },
  { _id: false }
);

/* ================= BILLING ================= */
const BillingSchema = new mongoose.Schema(
  {
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },

    taxRate: { type: Number, default: 0 },

    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },

    total: { type: Number, default: 0 },
  },
  { _id: false }
);

/* ================= ORDER ================= */
const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },

    orderId: {
      type: String,
      required: true,
      index: true,
    },

    /* ✅ ADD ROOT NAME (FIX FOR STRICT ERROR) */
    name: String, // 🔥 prevents "name not in schema" crash

    items: {
      type: [OrderItemSchema],
      default: [],
    },

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
      utr: String,
    },

    /* ================= RECEIPT ================= */
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

    /* ================= BILLING ================= */
    billing: {
      type: BillingSchema,
      default: null,
    },

    /* ================= ADDRESS ================= */
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

    /* ================= WAREHOUSE ================= */
    warehouse: {
      type: WarehouseSchema,
      default: {
        status: "NEW",
        assignedTo: null,
      },
    },
  },
  {
    timestamps: true,

    /* 🔥 SAFETY FIX (prevents strict crash on unknown fields) */
    strict: true,
  }
);

/* ================= APPLY PLUGIN PROPERLY ================= */
OrderSchema.plugin(safePlugin);

/* ================= SAFE EXPORT ================= */
const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
