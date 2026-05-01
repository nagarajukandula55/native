import mongoose from "mongoose";

const CompanySettingsSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    companyName: {
      type: String,
      required: true,
      default: "Native",
    },

    legalName: {
      type: String,
      default: "",
    },

    brandTagline: {
      type: String,
      default: "Eat Healthy Stay Healthy",
    },

    /* ================= GST DETAILS ================= */
    gstin: {
      type: String,
      default: "",
    },

    pan: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    stateCode: {
      type: String,
      default: "",
    },

    /* ================= ADDRESS ================= */
    addressLine1: String,
    addressLine2: String,
    city: String,
    pincode: String,
    country: {
      type: String,
      default: "India",
    },

    /* ================= CONTACT ================= */
    phone: String,
    email: String,
    whatsapp: String,

    /* ================= BANK DETAILS ================= */
    bankName: String,
    accountNumber: String,
    ifsc: String,
    accountName: String,

    /* ================= BRANDING ================= */
    logoUrl: {
      type: String,
      default: "/logo.png",
    },

    signatureUrl: {
      type: String,
      default: "/signature.png",
    },

    stampUrl: {
      type: String,
      default: "/stamp.png",
    },

    /* ================= NUMBERING SYSTEM ================= */
    invoicePrefix: {
      type: String,
      default: "NA",
    },

    receiptPrefix: {
      type: String,
      default: "NARCP", // ✅ as you requested (NA + RCP combined prefix)
    },

    financialYearStartMonth: {
      type: Number,
      default: 4, // April
    },
  },
  {
    timestamps: true,
  }
);

/* ================= SINGLETON GUARANTEE ================= */
export default mongoose.models.CompanySettings ||
  mongoose.model("CompanySettings", CompanySettingsSchema);
