import mongoose from "mongoose";

/* ================= SAFE NUMBER HELPER ================= */
const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

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

    price: {
      type: Number,
      required: true,
      set: safeNumber,
    },

    qty: {
      type: Number,
      required: true,
      set: safeNumber,
    },

    gstPercent: { type: Number, default: 0 },

    baseAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },

    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },

    total: { type: Number, default: 0 },

    /* 🔒 SNAPSHOT LOCK */
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

    gstNumber: {
      type: String,
      uppercase: true,
      trim: true,
    },

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

    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },

    taxableAmount: { type: Number, default: 0 },

    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },

    totalGST: { type: Number, default: 0 },

    roundOff: { type: Number, default: 0 },

    grandTotal: { type: Number, default: 0 },

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

    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,

    utr: String,

    transactionId: String,

    paidAt: Date,

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

    receiptUrl: String, // ✅ ADD THIS
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
      set: safeNumber,
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

  shipping: {
    
      dispatchType: {
        type: String,
        enum: [
          "COURIER",
          "BY_HAND",
          "LOCAL_DELIVERY"
        ],
      },
    
      courierPartner: String,
    
      awbNumber: String,
    
      trackingUrl: String,
    
      shipmentId: String,
    
      labelUrl: String,
    
      invoiceUrl: String,
    
      pickupScheduled: Boolean,
    
      pickupAt: Date,
    
      shippingCost: Number,
    
      packageWeight: Number,
    
      dimensions: {
    
        length: Number,
        breadth: Number,
        height: Number,
      },

    ewayBill: {

        ewbNumber: String,
      
        generatedAt: Date,
      
        validUpto: Date,
      
        transporterId: String,
      
        transporterName: String,
      
        ewbPdfUrl: String,
      
        status: String,
      
        distance: Number,
      
        vehicleNumber: String,
      },
    
      trackingStatus: String,
    
      deliveredAt: Date,
    }

    warehouse: {
      type: WarehouseSchema,
      default: () => ({}),
    },

    auditLogs: {
      type: [AuditSchema],
      default: [],
    },

    isDeleted: { type: Boolean, default: false },

    flags: {
      fraud: { type: Boolean, default: false },
      manualReview: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    strict: true, // ✅ FIXED (was your hidden crash source)
  }
);

/* ================= MIDDLEWARE (FIXED ORDER) ================= */
OrderSchema.pre("save", function (next) {
  console.log("💾 MONGOOSE SAVE ORDER:", this.orderId);
  next();
});

OrderSchema.pre("findOneAndUpdate", function () {
  console.log("🚨 findOneAndUpdate CALLED");
  console.log("🚨 QUERY:", this.getQuery());
  console.log("🚨 UPDATE:", this.getUpdate());
});

/* ================= INDEXES ================= */
OrderSchema.index({ "payment.razorpay_order_id": 1 });
OrderSchema.index({ "payment.razorpay_payment_id": 1 });
OrderSchema.index({ createdAt: -1 });

/* ================= EXPORT ================= */
const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
