import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const StoreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  },
  { timestamps: true }
);

// Hash password before saving
StoreSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
StoreSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const Store = mongoose.models.Store || mongoose.model("Store", StoreSchema);
export default Store;
