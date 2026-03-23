import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "admin", "store"],
      default: "user",
    },

    phone: String,
    address: String,
  },
  { timestamps: true }
);

// ✅ FIXED EXPORT (CRITICAL)
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
