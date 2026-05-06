import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

const Counter =
  mongoose.models.Counter ||
  mongoose.model("Counter", CounterSchema);

export async function generateOrderId() {
  const today = new Date();

  const datePart =
    today.getFullYear().toString().slice(2) +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");

  /* 🔥 SAFE COUNTER UPDATE */
  const counter = await Counter.findOneAndUpdate(
    { key: "orderId" }, // ✅ NEVER NULL
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  const seq = String(counter.seq).padStart(6, "0");

  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `NA-${datePart}-${seq}-${random}`;
}
