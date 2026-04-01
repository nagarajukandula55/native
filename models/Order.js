import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    customerName: String,
    phone: String,
    email: String,

    address: String,
    pincode: String,

    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        name: String,
        quantity: Number,
        price: Number,
      },
    ],

    totalAmount: Number,

    status: {
      type: String,
      default: "Order Placed",
    },

    paymentMethod: String,
    paymentStatus: {
      type: String,
      default: "Pending",
    },

    assignedStore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    warehouseAssignments: [
      {
        warehouseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Warehouse",
        },
      },
    ],

    awbNumber: String,
    courierName: String,
    trackingUrl: String,

    statusHistory: [
      {
        status: String,
        time: Date,
        updatedBy: mongoose.Schema.Types.ObjectId,
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* ✅ FIX: PROPER EXPORT */
export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
