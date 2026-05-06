import mongoose from "mongoose";

/* ================= SAFE COUNTER MODEL ================= */
const CounterSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* ✅ IMPORTANT FIX: prevent recompilation issues */
const Counter =
  mongoose.models.Counter ||
  mongoose.model("Counter", CounterSchema);

/* ================= RANDOM GENERATOR ================= */
const randomString = (len = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let str = "";
  for (let i = 0; i < len; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
};

/* ================= GENERATE ORDER ID ================= */
export async function generateOrderId() {
  try {
    const now = new Date();

    const datePart =
      String(now.getFullYear()).slice(2) +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");

    /* ================= DAILY KEY ================= */
    const counterKey = `order-${datePart}`;

    /* ================= ATOMIC INCREMENT ================= */
    const counter = await Counter.findOneAndUpdate(
      { key: counterKey },
      {
        $inc: { seq: 1 },
        $setOnInsert: { key: counterKey },
      },
      {
        new: true,
        upsert: true,
      }
    );

    const seqPart = String(counter.seq).padStart(6, "0");

    const randomPart = randomString(6);

    const orderId = `NA-${datePart}-${seqPart}-${randomPart}`;

    console.log("🆔 ORDER ID GENERATED:", orderId);

    return orderId;

  } catch (err) {
    console.error("❌ ORDER ID GENERATION FAILED:", err);
    throw err;
  }
}
