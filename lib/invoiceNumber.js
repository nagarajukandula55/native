import Order from "@/models/Order";

export async function generateInvoiceNumber(date = new Date()) {
  const prefix = "NA";

  const year = date.getFullYear();
  const fyStart = date.getMonth() + 1 >= 4 ? year : year - 1;
  const fyEnd = fyStart + 1;

  const fy = String(fyStart).slice(-2) + String(fyEnd).slice(-2);

  const start = new Date(`${fyStart}-04-01T00:00:00.000Z`);
  const end = new Date(`${fyEnd}-03-31T23:59:59.999Z`);

  const count = await Order.countDocuments({
    "invoice.generatedAt": { $gte: start, $lte: end },
  });

  const series = String(count + 1).padStart(3, "0");

  return `${prefix}${fy}${series}`;
}
