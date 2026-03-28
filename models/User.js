import mongoose from "mongoose";

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

    isActive: { type: Boolean, default: true }, // optional but useful for deactivating users
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
