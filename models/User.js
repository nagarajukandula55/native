// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "admin", "store", "branding"],
      default: "user",
    },

    // For store users
    warehouseId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Warehouse", 
      default: null 
    },
    warehouseName: { type: String, default: null },
    warehouseCode: { type: String, default: null },

    isActive: { type: Boolean, default: true }, // deactivate users if needed
  },
  { timestamps: true }
);

// ====================== PASSWORD HASHING ======================
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ====================== COMPARE PASSWORD ======================
UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// ====================== EXPORT MODEL ======================
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
