import { anPost } from "./client";

export async function updateWarehouseStatus(payload: {
  orderId: string;
  status: string;
}) {
  return anPost("/api/warehouse/update-status", payload);
}
