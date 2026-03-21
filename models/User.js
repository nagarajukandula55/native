import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
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

    /* ✅ ROLE SYSTEM */
    role: {
      type: String,
      enum: ["user", "admin", "store"],
      default: "user",
    },

    /* ✅ OPTIONAL FIELDS (FUTURE READY) */
    phone: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /* 🔐 RESET PASSWORD */
    resetToken: {
      type: String,
      default: "",
    },

    resetTokenExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/* 🔐 HASH PASSWORD BEFORE SAVE */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

/* 🔐 COMPARE PASSWORD */
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User =
  mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
