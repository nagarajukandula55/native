export default async function generateInvoiceNumber(
  Company,
  Order
) {
  const company =
    await Company.findOne().lean();

  const prefix =
    company?.invoicePrefix || "NA";

  const now = new Date();

  /* ================= DATE ================= */
  const yy = String(
    now.getFullYear()
  ).slice(-2);

  const mm = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const dd = String(
    now.getDate()
  ).padStart(2, "0");

  const datePart =
    `${yy}${mm}${dd}`;

  /* ================= DAILY COUNT ================= */
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );

  const count =
    await Order.countDocuments({
      "invoice.generatedAt": {
        $gte: start,
        $lte: end,
      },
    });

  const serial = String(
    count + 1
  ).padStart(6, "0");

  /* ================= RANDOM ================= */
  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `${prefix}-${datePart}-${serial}-${random}`;
}
