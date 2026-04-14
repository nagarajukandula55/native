import mongoose from "mongoose";

/* ================= USER SCHEMA ================= */

const UserSchema = new mongoose.Schema(
  {
    /* BASIC INFO */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    /* ROLE SYSTEM */
    role: {
      type: String,
      enum: [
        "super_admin",
        "admin",
        "customer_support",
        "finance",
        "vendor",
        "branding",
        "customer",
        "analytics",
      ],
      default: "customer",
    },

    /* ACCOUNT STATUS */
    isActive: {
      type: Boolean,
      default: true,
    },

    /* OPTIONAL PROFILE */
    phone: {
      type: String,
      default: "",
    },

    avatar: {
      type: String, // Cloudinary URL
      default: "",
    },

    /* VENDOR SPECIFIC (IMPORTANT FOR YOU) */
    vendorDetails: {
      businessName: { type: String },
      gstNumber: { type: String },
      address: { type: String },
    },

    /* SECURITY */
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

/* ================= EXPORT ================= */

export default mongoose.models.User || mongoose.model("User", UserSchema);
