import mongoose from "mongoose";

const PaymentSettingsSchema = new mongoose.Schema(
  {
    cod: {
      type: Boolean,
      default: true,
    },

    razorpay: {
      type: Boolean,
      default: false,
    },

    upi: {
      type: Boolean,
      default: false,
    },

    whatsapp: {
      type: Boolean,
      default: false,
    },

    upiId: {
      type: String,
      default: "",
    },

    whatsappNumber: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const PaymentSettings =
  mongoose.models.PaymentSettings ||
  mongoose.model("PaymentSettings", PaymentSettingsSchema);

export default PaymentSettings;
