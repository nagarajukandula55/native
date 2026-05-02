import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  key: { type: String, unique: true }, // e.g. "RECEIPT_20260502"
  seq: { type: Number, default: 0 },
});

export default mongoose.models.Counter ||
  mongoose.model("Counter", CounterSchema);
