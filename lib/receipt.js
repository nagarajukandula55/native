import Order from "@/models/Order";

export async function generateReceiptNumber() {
  const prefix = "NARCP";

  const today = new Date();

  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const dateStr = `${yyyy}${mm}${dd}`;

  const startOfDay = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
  const endOfDay = new Date(`${yyyy}-${mm}-${dd}T23:59:59.999Z`);

  const count = await Order.countDocuments({
    "receipt.generatedAt": {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  const sequence = String(count + 1).padStart(3, "0");

  return `${prefix}${dateStr}${sequence}`;
}
