import Counter from "@/models/Counter";

/* ================= LOCKED RECEIPT GENERATOR ================= */
export async function generateReceiptNumber() {
  const prefix = "NARCP";

  const today = new Date();

  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const dateStr = `${yyyy}${mm}${dd}`;

  const counterKey = `RECEIPT_${dateStr}`;

  const counter = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const sequence = String(counter.seq).padStart(4, "0");

  return `${prefix}${dateStr}${sequence}`;
}
