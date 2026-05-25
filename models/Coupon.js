import mongoose from "mongoose";

const CouponSchema =
  new mongoose.Schema(
    {
      code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true,
      },

      type: {
        type: String,
        enum: ["flat", "percent"],
        required: true,
      },

      value: {
        type: Number,
        required: true,
      },

      minCartValue: {
        type: Number,
        default: 0,
      },

      maxDiscount: {
        type: Number,
        default: 0,
      },

      usageLimit: {
        type: Number,
        default: 0,
      },

      usedCount: {
        type: Number,
        default: 0,
      },

      active: {
        type: Boolean,
        default: true,
      },

      expiry: {
        type: Date,
      },

      usedBy: [
        {
          type: String,
        },
      ],
    },
    {
      timestamps: true,
    }
  );

export default
  mongoose.models.Coupon ||
  mongoose.model(
    "Coupon",
    CouponSchema
  );
