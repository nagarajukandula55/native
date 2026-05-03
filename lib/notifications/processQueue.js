import NotificationQueue from "@/models/NotificationQueue";
import { sendInvoiceEmail } from "./email";

export async function processNotificationQueue() {
  const items = await NotificationQueue.find({
    status: "PENDING",
    attempts: { $lt: 3 },
  }).limit(20);

  for (const item of items) {
    try {
      item.attempts += 1;

      /* ================= EMAIL ================= */
      if (item.type === "EMAIL") {
        await sendInvoiceEmail(item.payload);
      }

      item.status = "SUCCESS";
      await item.save();

    } catch (err) {
      item.error = err.message;

      if (item.attempts >= 3) {
        item.status = "FAILED";
      }

      await item.save();
    }
  }
}
