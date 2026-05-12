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

    sku: String,

    variant: String,

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

    gstPercent: {
      type: Number,
      default: 0,
    },

    baseAmount: {
      type: Number,
      default: 0,
    },

    discountAmount: {
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

    total: {
      type: Number,
      default: 0,
    },

    /* 🔒 SNAPSHOT LOCK */
    snapshot: {
      brand: String,

      category: String,

      hsn: {
        type: String,
        required: true,   // 🔥 ADD THIS
        trim: true
      },

      sku: String,

      weight: Number,
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

    country: {
      type: String,
      default: "India",
    },

    pincode: String,

    gstNumber: {
      type: String,
      uppercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          if (this.gstType === "B2B") {
            return !!v;
          }
          return true;
        },
        message: "GST Number is required for B2B invoices",
      },
    },

    gstType: {
      type: String,
      enum: ["B2C", "B2B"],
      default: function () {
        return this.gstNumber ? "B2B" : "B2C";
      },
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
      enum: ["RAZORPAY", "UPI", "COD", "UNKNOWN"],
      default: "UNKNOWN",
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
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

    refundedAt: Date,

    refundId: String,

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
    },

    courierPartner: String,

    courierCode: String,

    awbNumber: String,

    shipmentId: String,

    orderShipmentId: String,

    trackingUrl: String,

    trackingStatus: String,

    labelUrl: String,

    manifestUrl: String,

    invoiceUrl: String,

    pickupScheduled: {
      type: Boolean,
      default: false,
    },

    pickupAt: Date,

    shippingCost: {
      type: Number,
      default: 0,
    },

    packageWeight: {
      type: Number,
      default: 0,
    },

    dimensions: {
      length: Number,

      breadth: Number,

      height: Number,
    },

    transporterId: String,

    transporterName: String,

    vehicleNumber: String,

    deliveryAgent: String,

    deliveryPhone: String,

    deliveredAt: Date,

    shippedAt: Date,

    notes: String,
  },
  { _id: false }
);

/* ================= EWAY BILL ================= */
const EwayBillSchema = new mongoose.Schema(
  {
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

    packingNotes: String,

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
        "AWB_GENERATED",
        "PICKUP_SCHEDULED",
        "DISPATCHED",
        "OUT_FOR_DELIVERY",
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

      awbGeneratedAt: Date,

      pickupScheduledAt: Date,

      dispatchedAt: Date,

      outForDeliveryAt: Date,

      deliveredAt: Date,

      cancelledAt: Date,
    },

    address: AddressSchema,

    payment: PaymentSchema,

    invoice: InvoiceSchema,

    receipt: ReceiptSchema,

    shipping: ShippingSchema,

    ewayBill: EwayBillSchema,

    warehouse: {
      type: WarehouseSchema,
      default: () => ({}),
    },

    auditLogs: {
      type: [AuditSchema],
      default: [],
    },

    telegramNotified: {
      type: Boolean,
      default: false,
    },

    receiptEmailSent: {
      type: Boolean,
      default: false,
    },

    invoiceEmailSent: {
      type: Boolean,
      default: false,
    },

    shippingLabelPrinted: {
      type: Boolean,
      default: false,
    },

    packingSlipPrinted: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    flags: {
      fraud: {
        type: Boolean,
        default: false,
      },

      gstLocked: {
        type: Boolean,
          default: true
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

/* ================= BILLING OS v2 EXTENSIONS ================= */

/* ---------- TAX EXTENSION (FUTURE PROOF) ---------- */
OrderSchema.add({
  taxMeta: {
    cess: {
      type: Number,
      default: 0,
    },

    tds: {
      type: Number,
      default: 0,
    },

    tcs: {
      type: Number,
      default: 0,
    },

    taxVersion: {
      type: String,
      default: "v2",
    },
  },
});

/* ---------- INVOICE IMMUTABILITY LAYER ---------- */
OrderSchema.add({
  invoiceAudit: [
    {
      invoiceNumber: String,
      snapshot: Object,
      hash: String,
      generatedAt: Date,
      generatedBy: String,
      action: {
        type: String,
        enum: ["GENERATED", "REGENERATED", "VOIDED"],
      },
    },
  ],
});

/* ---------- DIGITAL VERIFICATION SYSTEM ---------- */
OrderSchema.add({
  verification: {
    invoiceHash: String,

    qrPayloadHash: String,

    verifyUrl: String,

    verified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: Date,
  },
});

/* ---------- GST LINE ITEM AUDIT (ENTERPRISE COMPLIANCE) ---------- */
OrderSchema.add({
  gstAudit: {
    cgstTotal: Number,

    sgstTotal: Number,

    igstTotal: Number,

    taxableTotal: Number,

    gstMismatch: {
      type: Boolean,
      default: false,
    },

    mismatchReason: String,
  },
});

/* ---------- STATE CHANGE EVENT SOURCE ---------- */
OrderSchema.add({
  events: [
    {
      type: {
        type: String,
        enum: [
          "ORDER_CREATED",
          "PAYMENT_SUCCESS",
          "INVOICE_GENERATED",
          "INVOICE_DOWNLOADED",
          "SHIPPED",
          "DELIVERED",
          "REFUNDED",
          "STATUS_CHANGED"
        ],
      },

      data: Object,

      at: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

OrderSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();

  if (!update?.status && !update?.$set?.status) return;

  const doc = await this.model.findOne(this.getQuery()).select("status");

  const from = doc?.status;
  const to = update.status || update.$set?.status;

  this._statusEvent = { from, to };
});

OrderSchema.post("findOneAndUpdate", async function () {
  const event = this._statusEvent;
  if (!event) return;

  await this.model.updateOne(this.getQuery(), {
    $push: {
      events: {
        type: "STATUS_CHANGED",
        data: event,
        at: new Date(),
      },
    },
  });
});

/* ================= MIDDLEWARE ================= */

/* LOG SAVE + TRACK PREVIOUS STATUS */
OrderSchema.pre("save", async function (next) {
  console.log("💾 SAVE:", this.orderId);

  try {
    // Capture previous status safely
    if (this.isNew) {
      this._previousStatus = null;
    } else if (this.isModified("status")) {
      const original = await this.constructor
        .findById(this._id)
        .select("status")
        .lean();

      this._previousStatus = original?.status || null;
    }

    // Ensure events array exists
    if (!Array.isArray(this.events)) {
      this.events = [];
    }

    const from = this._previousStatus;
    const to = this.status;

    // Skip if no real change
    if (from === to) return next();

    // Prevent duplicate STATUS_CHANGED events
    const exists = this.events.some(
      (e) =>
        e.type === "STATUS_CHANGED" &&
        e.data?.from === from &&
        e.data?.to === to
    );

    if (!exists) {
      this.events.push({
        type: "STATUS_CHANGED",
        data: { from, to },
        at: new Date(),
      });
    }

    return next();
  } catch (err) {
    return next(err);
  }
});

/* LOG UPDATE OPERATIONS */
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
  status: 1,
});

OrderSchema.index({
  createdAt: -1,
});

OrderSchema.index({
  "invoice.invoiceNumber": 1,
});

OrderSchema.index({
  "verification.invoiceHash": 1,
});

OrderSchema.index({
  "statusTimeline.paidAt": -1,
});

/* ================= EXPORT ================= */
const Order =
  mongoose.models.Order ||
  mongoose.model(
    "Order",
    OrderSchema
  );

export default Order;
