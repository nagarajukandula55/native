import Counter from "@/models/Counter";

/* ================= RANDOM SUFFIX ================= */
function randomString(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

/* ================= DATE FORMAT ================= */
function getDateCode() {
  const now = new Date();

  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  return `${yy}${mm}${dd}`; // 260430
}

/* ================= MAIN ================= */
export async function generateOrderId() {
  const dateCode = getDateCode();

  const counter = await Counter.findOneAndUpdate(
    { date: dateCode },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = String(counter.seq).padStart(6, "0");

  const random = randomString(6);

  return `NA-${dateCode}-${seq}-${random}`;
}
