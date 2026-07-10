import { anGet, anPost } from "./client";

export async function getInventory() {
  return anGet("/api/inventory");
}

export async function updateInventory(payload: any) {
  return anPost("/api/inventory", payload);
}
