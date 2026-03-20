import mongoose from "mongoose";

const PaymentSettingsSchema = new mongoose.Schema(
  {
    cod: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true },
    razorpay: { type: Boolean, default: false },

    whatsappNumber: { type: String, default: "" }
  },
  { timestamps: true }
);

const PaymentSettings =
  mongoose.models.PaymentSettings ||
  mongoose.model("PaymentSettings", PaymentSettingsSchema);

export default PaymentSettings;
