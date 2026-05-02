import Counter from "@/models/Counter";

/* ================= FINANCIAL YEAR HELPER ================= */
function getFinancialYear() {
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  let startYear, endYear;

  if (month >= 4) {
    startYear = year;
    endYear = year + 1;
  } else {
    startYear = year - 1;
    endYear = year;
  }

  return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`; // ✅ 26-27
}

/* ================= LOCKED RECEIPT GENERATOR ================= */
export async function generateReceiptNumber() {
  const prefix = "NARCP";

  const fy = getFinancialYear(); // ✅ 26-27

  const counterKey = `RECEIPT_${fy}`;

  const counter = await Counter.findOneAndUpdate(
    { key: counterKey },
    {
      $inc: { seq: 1 },
      $setOnInsert: { key: counterKey, seq: 0 }, // 🔥 FIX
    },
    {
      new: true,
      upsert: true,
    }
  );

  let seq = counter?.seq;

  if (!seq || isNaN(seq)) seq = 1;

  const sequence = String(seq).padStart(4, "0");

  return `${prefix}${fy}-${sequence}`; // ✅ NARCP26-27-0001
}
