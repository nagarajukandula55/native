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

    /* 🔒 SNAPSHOT LOCK (prevents future product changes affecting past orders) */
    snapshot: {
      brand: String,
      category: String,
      hsn: String,
    },
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

    /* GST TYPE */
    gstType: {
      type: String,
      enum: ["B2C", "B2B"],
      default: "B2C",
    },
  },
  { _id: false }
);

/* ================= BILLING ================= */
const BillingSchema = new mongoose.Schema(
  {
    currency: { type: String, default: "INR" },

    subtotal: Number,
    discount: Number,

    taxableAmount: Number,

    cgst: Number,
    sgst: Number,
    igst: Number,

    totalGST: Number,

    roundOff: { type: Number, default: 0 },

    grandTotal: Number,

    /* 🔒 FINAL LOCK FLAG */
    locked: { type: Boolean, default: true },
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
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    amountPaid: { type: Number, default: 0 },

    /* Gateway */
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,

    /* UPI */
    utr: String,

    paidAt: Date,

    /* 🔒 FULL PAYMENT LOG */
    logs: [
      {
        status: String,
        message: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { _id: false }
);

/* ================= INVOICE ================= */
const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: String,
    generatedAt: Date,
    invoiceUrl: String,

    /* 🔒 SNAPSHOT COPY (legal compliance) */
    billingSnapshot: Object,
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
    outForDeliveryAt: Date,
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
    meta: Object,
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

    /* 🔒 IDEMPOTENCY (prevents duplicate orders) */
    idempotencyKey: {
      type: String,
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
        "REFUNDED",
      ],
      default: "PENDING_PAYMENT",
    },

    /* STATUS TIMESTAMPS (VERY IMPORTANT) */
    statusTimeline: {
      paidAt: Date,
      processedAt: Date,
      packedAt: Date,
      dispatchedAt: Date,
      deliveredAt: Date,
      cancelledAt: Date,
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

    /* 🔒 SOFT DELETE */
    isDeleted: { type: Boolean, default: false },

    /* 🔒 INTERNAL FLAGS */
    flags: {
      fraud: { type: Boolean, default: false },
      manualReview: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,

    /* ✅ FINAL DECISION */
    strict: true, // 🔥 now SAFE because we fully control payload
  }
);

/* ================= INDEXES ================= */
OrderSchema.index({ "payment.razorpay_order_id": 1 });
OrderSchema.index({ "payment.razorpay_payment_id": 1 });
OrderSchema.index({ createdAt: -1 });

/* ================= EXPORT ================= */
const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;

OrderSchema.pre("findOneAndUpdate", function () {
  console.log("🚨 findOneAndUpdate CALLED");
  console.log("🚨 QUERY:", this.getQuery());
  console.log("🚨 UPDATE:", this.getUpdate());
});
