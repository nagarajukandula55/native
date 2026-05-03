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

  if (order.status === "PAID") {
  await WebhookLog.create({
    provider: "razorpay",
    event: event.event,
    payload: event,
    signatureValid: true,
    processed: false,
    status: "FAILED",
    error: "Duplicate payment ignored",
  });

  return NextResponse.json({
    success: true,
    message: "Already processed",
  });
}
);

export default mongoose.models.WebhookLog ||
  mongoose.model("WebhookLog", WebhookLogSchema);
