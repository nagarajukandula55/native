import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.models.Counter ||
  mongoose.model("Counter", CounterSchema);
