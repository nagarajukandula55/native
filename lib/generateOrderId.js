import mongoose from "mongoose";

/* ================= COUNTER MODEL ================= */
const CounterSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter =
  mongoose.models.Counter ||
  mongoose.model("Counter", CounterSchema);

/* ================= GENERATE ORDER ID ================= */
export async function generateOrderId() {
  try {
    const now = new Date();

    /* ================= DATE FORMAT ================= */
    const year = now.getFullYear().toString().slice(2); // 26
    const month = String(now.getMonth() + 1).padStart(2, "0"); // 05
    const day = String(now.getDate()).padStart(2, "0"); // 06

    const datePart = `${year}${month}${day}`; // 260506

    /* ================= DAILY COUNTER KEY ================= */
    const counterKey = `order-${datePart}`; // 🔥 UNIQUE PER DAY

    /* ================= SAFE COUNTER ================= */
    const counter = await Counter.findOneAndUpdate(
      { key: counterKey }, // ✅ NEVER NULL
      { $inc: { seq: 1 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const seq = String(counter.seq).padStart(6, "0");

    /* ================= RANDOM SUFFIX ================= */
    const random = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    /* ================= FINAL FORMAT ================= */
    const orderId = `NA-${datePart}-${seq}-${random}`;

    console.log("🆔 GENERATED ORDER ID:", orderId);

    return orderId;

  } catch (err) {
    console.error("❌ ORDER ID ERROR:", err);
    throw err;
  }
}
