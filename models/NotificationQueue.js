import mongoose from "mongoose";

const NotificationQueueSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["EMAIL", "WHATSAPP"],
    },

    orderId: String,

    payload: Object,

    attempts: { type: Number, default: 0 },

    maxAttempts: { type: Number, default: 3 },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    error: String,
  },
  { timestamps: true }
);

export default mongoose.models.NotificationQueue ||
  mongoose.model("NotificationQueue", NotificationQueueSchema);
