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
      sku: String,
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
    country: {
      type: String,
      default: "India",
    },

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
    currency: {
      type: String,
      default: "INR",
    },

    subtotal: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    taxableAmount: {
      type: Number,
      default: 0,
    },

    cgst: {
      type: Number,
      default: 0,
    },

    sgst: {
      type: Number,
      default: 0,
    },

    igst: {
      type: Number,
      default: 0,
    },

    totalGST: {
      type: Number,
      default: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
    },

    packingCharge: {
      type: Number,
      default: 0,
    },

    roundOff: {
      type: Number,
      default: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
    },

    locked: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

/* ================= PAYMENT ================= */
const PaymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: [
        "RAZORPAY",
        "UPI",
        "COD",
        "BANK_TRANSFER",
        "CASH",
        "UNKNOWN",
      ],
      default: "UNKNOWN",
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "SUCCESS",
        "FAILED",
        "REFUNDED",
      ],
      default: "PENDING",
    },

    amountPaid: {
      type: Number,
      default: 0,
    },

    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,

    utr: String,

    transactionId: String,

    paidAt: Date,

    refundId: String,

    refundAmount: {
      type: Number,
      default: 0,
    },

    refundAt: Date,

    logs: [
      {
        status: String,
        message: String,
        at: {
          type: Date,
          default: Date.now,
        },
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

    pdfUrl: String,

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

    receiptUrl: String,

    pdfUrl: String,
  },
  { _id: false }
);

/* ================= SHIPPING ================= */
const ShippingSchema = new mongoose.Schema(
  {
    dispatchType: {
      type: String,
      enum: [
        "COURIER",
        "BY_HAND",
        "LOCAL_DELIVERY",
      ],
      default: "COURIER",
    },

    courierPartner: String,

    courierCode: String,

    awbNumber: String,

    shipmentId: String,

    orderShipmentId: String,

    trackingUrl: String,

    trackingStatus: {
      type: String,
      default: "NOT_DISPATCHED",
    },

    labelUrl: String,

    manifestUrl: String,

    invoiceUrl: String,

    pickupScheduled: {
      type: Boolean,
      default: false,
    },

    pickupTokenNumber: String,

    pickupAt: Date,

    shippingCost: {
      type: Number,
      default: 0,
    },

    estimatedDeliveryDate: Date,

    packageWeight: {
      type: Number,
      default: 0,
    },

    dimensions: {
      length: {
        type: Number,
        default: 0,
      },

      breadth: {
        type: Number,
        default: 0,
      },

      height: {
        type: Number,
        default: 0,
      },
    },

    trackingEvents: [
      {
        status: String,
        location: String,
        remark: String,
        at: Date,
      },
    ],

    /* ================= EWAY BILL ================= */

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

    dispatchedAt: Date,

    outForDeliveryAt: Date,

    deliveredAt: Date,
  },
  { _id: false }
);

/* ================= WAREHOUSE ================= */
const WarehouseSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "NEW",
        "PICKING",
        "PACKED",
        "DISPATCHED",
        "DELIVERED",
      ],
      default: "NEW",
    },

    assignedTo: String,

    pickerName: String,

    packerName: String,

    packingSlipUrl: String,

    deliveryChallanUrl: String,

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

    at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/* ================= MAIN ORDER ================= */
const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: null,
    },

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

    invoice: ReceiptSchema,

    receipt: ReceiptSchema,

    shipping: {
      type: ShippingSchema,
      default: () => ({}),
    },

    warehouse: {
      type: WarehouseSchema,
      default: () => ({}),
    },

    telegram: {
      orderSent: {
        type: Boolean,
        default: false,
      },

      paidSent: {
        type: Boolean,
        default: false,
      },

      dispatchedSent: {
        type: Boolean,
        default: false,
      },
    },

    emailLogs: [
      {
        type: String,
        status: String,
        at: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    auditLogs: {
      type: [AuditSchema],
      default: [],
    },

    notes: [
      {
        text: String,
        by: String,
        at: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },

    flags: {
      fraud: {
        type: Boolean,
        default: false,
      },

      manualReview: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

/* ================= MIDDLEWARE ================= */
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
OrderSchema.index({
  "payment.razorpay_order_id": 1,
});

OrderSchema.index({
  "payment.razorpay_payment_id": 1,
});

OrderSchema.index({
  "shipping.awbNumber": 1,
});

OrderSchema.index({
  createdAt: -1,
});

/* ================= EXPORT ================= */
const Order =
  mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);

export default Order;
