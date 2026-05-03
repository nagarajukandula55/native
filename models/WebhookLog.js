import mongoose from "mongoose";

const WebhookLogSchema = new mongoose.Schema(
  {
    provider: { type: String, default: "razorpay" },

    event: String,

    payload: Object,

    signatureValid: Boolean,

    processed: { type: Boolean, default: false },

    orderId: String,

    status: {
      type: String,
      enum: ["RECEIVED", "PROCESSED", "FAILED"],
      default: "RECEIVED",
    },

    error: String,
  },
  { timestamps: true }
);

export default mongoose.models.WebhookLog ||
  mongoose.model("WebhookLog", WebhookLogSchema);
