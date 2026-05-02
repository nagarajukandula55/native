import Counter from "@/models/Counter";

/* ================= FINANCIAL YEAR HELPER ================= */
function getFinancialYear() {
  const today = new Date();
  const year = today.getFullYear();

  // FY logic (April - March)
  const startYear = today.getMonth() >= 3 ? year : year - 1;
  const endYear = startYear + 1;

  return `${String(startYear).slice(-2)}${String(endYear).slice(-2)}`;
}

/* ================= LOCKED RECEIPT GENERATOR ================= */
export async function generateReceiptNumber() {
  const prefix = "NARCP";

  const fy = getFinancialYear(); // 2627 style

  const counterKey = `RECEIPT_${fy}`;

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

  let seq = counter?.seq;

  if (!seq || isNaN(seq)) seq = 1;

  const sequence = String(seq).padStart(4, "0");

  return `${prefix}${fy}${sequence}`;
}
