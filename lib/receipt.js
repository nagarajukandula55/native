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

  /* ================= FIND LAST RECEIPT OF TODAY ================= */
  const lastOrder = await Order.findOne({
    "receipt.receiptNumber": {
      $regex: `^${base}`,
    },
  })
    .sort({ "receipt.receiptNumber": -1 })
    .lean();

  let sequence = 1;

  if (lastOrder?.receipt?.receiptNumber) {
    const lastSeq = parseInt(
      lastOrder.receipt.receiptNumber.slice(-3)
    );

    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }

  const seqStr = String(sequence).padStart(3, "0");

  return `${base}${seqStr}`;
}
