import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const StoreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: { type: String, required: true },

    // 🔗 Warehouse Mapping (already you added — keep it)
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    // 🧠 Role System (future-proof)
    role: {
      type: String,
      enum: ["store", "warehouse", "admin"],
      default: "store",
    },

    // 🔐 Control Flags
    isActive: {
      type: Boolean,
      default: true,
    },

    // 📊 Performance Tracking (used later)
    stats: {
      totalOrders: { type: Number, default: 0 },
      packedOrders: { type: Number, default: 0 },
      shippedOrders: { type: Number, default: 0 },
      deliveredOrders: { type: Number, default: 0 },
    },

    // 📍 Optional Store Info (for courier labels later)
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
    },
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
StoreSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// 🔑 Compare password
StoreSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const Store =
  mongoose.models.Store || mongoose.model("Store", StoreSchema);

export default Store;
