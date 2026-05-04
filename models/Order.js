import mongoose from "mongoose";

/* ================= ORDER ITEM ================= */
const OrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productKey: String,
    name: String,
    image: String,

    price: { type: Number, required: true },
    qty: { type: Number, required: true },

    gstPercent: { type: Number, default: 0 },

    baseAmount: Number,
    discountAmount: { type: Number, default: 0 },

    taxableAmount: Number,

    cgst: Number,
    sgst: Number,
    igst: Number,

    total: Number,
  },
  { _id: false }
);

/* ================= ADDRESS ================= */
const AddressSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    email: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    gstNumber: String,
  },
  { _id: false }
);

/* ================= BILLING ================= */
const BillingSchema = new mongoose.Schema(
  {
    subtotal: Number,
    discount: Number,
    taxableAmount: Number,

    cgst: Number,
    sgst: Number,
    igst: Number,

    totalGST: Number,
    grandTotal: Number,
  },
  { _id: false }
);

/* ================= PAYMENT ================= */
const PaymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["RAZORPAY", "UPI", "COD", "UNKNOWN"],
      default: "UNKNOWN",
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,

    utr: String,

    paidAt: Date,
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

/* ================= RECEIPT ================= */
const ReceiptSchema = new mongoose.Schema(
  {
    receiptNumber: String,
    generatedAt: Date,
    amountPaid: Number,
    paymentMode: String,
  },
  { _id: false }
);

/* ================= WAREHOUSE ================= */
const WarehouseSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["NEW", "PICKING", "PACKED", "DISPATCHED", "DELIVERED"],
      default: "NEW",
    },

    assignedTo: String,

    packedAt: Date,
    dispatchedAt: Date,
    deliveredAt: Date,
  },
  { _id: false }
);

/* ================= AUDIT ================= */
const AuditSchema = new mongoose.Schema(
  {
    action: String,
    from: String,
    to: String,
    by: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* ================= MAIN ORDER ================= */
const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },

    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    items: {
      type: [OrderItemSchema],
      required: true,
    },

    billing: BillingSchema,

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
        "DISPATCHED",
        "DELIVERED",
        "CANCELLED",
        "FAILED",
      ],
      default: "PENDING_PAYMENT",
    },

    address: AddressSchema,

    payment: PaymentSchema,

    invoice: InvoiceSchema,
    receipt: ReceiptSchema,

    warehouse: {
      type: WarehouseSchema,
      default: () => ({}),
    },

    auditLogs: {
      type: [AuditSchema],
      default: [],
    },
  },
  {
    timestamps: true,

    /* ✅ IMPORTANT: prevents your previous crash */
    strict: false,
  }
);

const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
