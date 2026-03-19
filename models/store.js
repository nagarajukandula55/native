// models/store.js
import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // store password (hashed)
    code: { type: String, required: true, unique: true }, // optional store code
    contact: { type: String },
    assignedWarehouses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" }],
    role: { type: String, default: "store" },
  },
  { timestamps: true }
);

const Store = mongoose.models.Store || mongoose.model("Store", storeSchema);
export default Store;
