import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
});

export default mongoose.models.Store || mongoose.model("Store", storeSchema);
