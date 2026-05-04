import mongoose from "mongoose";
import { safePlugin } from "@/lib/mongoose/safePlugin";

/* ================= ORDER ITEM ================= */
const OrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productKey: {
      type: String,
      default: null,
    },

    image: String,
    price: Number,
    qty: Number,
    gstPercent: Number,
    baseAmount: Number,
    total: Number,
  },
  {
    _id: false,
    strict: true, // ✅ IMPORTANT: keep strict inside subdocs
  }
);

/* ================= WAREHOUSE ================= */
const WarehouseSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["NEW", "PICKING", "PACKED", "DISPATCHED"],
      default: "NEW",
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
      default: "PENDING_PAYMENT",
    },

    payment: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
      method: String,
      paidAt: Date,
      utr: String,
    },

    receipt: {
      type: ReceiptSchema,
      default: null,
    },

    invoice: {
      type: InvoiceSchema,
      default: null,
    },

    invoiceHTML: {
      type: String,
      default: "",
    },

    billing: {
      type: BillingSchema,
      default: null,
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

    // 🔥 CRITICAL FIX
    strict: true,
    minimize: false,
  }
);

/* ================= SAFETY PLUGIN ================= */
OrderSchema.plugin(safePlugin);

/* ================= MODEL EXPORT ================= */
const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
