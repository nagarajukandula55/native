import Order from "@/models/Order";

/* ================= LOCKED RECEIPT GENERATOR ================= */
export async function generateReceiptNumber() {
  const prefix = "NARCP";

  const today = new Date();

  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const dateStr = `${yyyy}${mm}${dd}`;
  const base = `${prefix}${dateStr}`;

  /* ================= STRICT COUNT-BASED SEQUENCE ================= */
  const startOfDay = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
  const endOfDay = new Date(`${yyyy}-${mm}-${dd}T23:59:59.999Z`);

  const count = await Order.countDocuments({
    "receipt.generatedAt": {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  /* ================= SAFE SEQUENCE ================= */
  const sequence = String(count + 1).padStart(4, "0"); 
  // 🔥 4 digits prevents future overflow (0001 → 9999 safe)

  return `${base}${sequence}`;
}
