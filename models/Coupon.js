import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema({
  code: String,
  type: String, // flat | percent
  value: Number,
  minCartValue: Number,
  maxDiscount: Number,
  usageLimit: Number,
  usedBy: [String],
  expiry: Date,
  active: Boolean,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Coupon ||
  mongoose.model("Coupon", CouponSchema);
