import mongoose from "mongoose"
import bcrypt from "bcryptjs"

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
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["ADMIN", "STORE", "USER", "BRANDING"],
      default: "USER",
      index: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
      default: "ACTIVE",
      index: true,
    },

    // 🔗 Store = Warehouse Mapping
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null,
    },

    // 🔐 Security / Tracking
    lastLogin: {
      type: Date,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

/* =========================
   🔐 PASSWORD HASHING
========================= */

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

/* =========================
   ⚡ INDEXES
========================= */

UserSchema.index({ email: 1 })
UserSchema.index({ role: 1, status: 1 })

export default mongoose.models.User ||
  mongoose.model("User", UserSchema)
