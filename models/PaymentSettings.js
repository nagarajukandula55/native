import mongoose from "mongoose";

const PaymentSettingsSchema = new mongoose.Schema({
  cod: { type: Boolean, default: true },
  whatsapp: { type: Boolean, default: true },
  razorpay: { type: Boolean, default: false },
  whatsappNumber: { type: String, default: "" },
});

export default mongoose.models.PaymentSettings ||
  mongoose.model("PaymentSettings", PaymentSettingsSchema);
