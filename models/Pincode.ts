import mongoose, {
  Connection,
} from "mongoose";

const PincodeSchema =
  new mongoose.Schema(
    {
      pincode: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      officeName: {
        type: String,
        default: "",
      },

      district: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      country: {
        type: String,
        default: "India",
      },

      deliveryStatus: {
        type: String,
        default: "Delivery",
      },

      isServiceable: {
        type: Boolean,
        default: true,
      },

      isCODAvailable: {
        type: Boolean,
        default: true,
      },

      shippingZone: {
        type: String,
        default: "A",
      },

      estimatedDays: {
        type: Number,
        default: 3,
      },

      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
      collection: "pincodes",
    }
  );

export const getPincodeModel = (
  conn: Connection
) => {
  return (
    conn.models.Pincode ||
    conn.model(
      "Pincode",
      PincodeSchema,
      "pincodes"
    )
  );
};
