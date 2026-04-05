import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },

  role: {
    type: String,
    enum: ["admin", "store", "user", "branding"],
    default: "user",
  },

  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
  },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

schema.pre("save", async function(next){
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password,10);
  next();
});

schema.methods.comparePassword = function(pw){
  return bcrypt.compare(pw,this.password);
};

export default mongoose.models.User || mongoose.model("User", schema);
