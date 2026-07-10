import { anGet } from "./client";

export async function getReceipt(orderId: string) {
  return anGet(`/api/receipt/${orderId}`);
}
