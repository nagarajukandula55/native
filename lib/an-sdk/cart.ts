import { anPost } from "./client";

export async function enrichCart(items: any[]) {
  return anPost("/api/cart/enrich", { items });
}
