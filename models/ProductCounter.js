import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  brand: { type: String, unique: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.models.ProductCounter ||
  mongoose.model("ProductCounter", CounterSchema);
