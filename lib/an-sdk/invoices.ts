import { anGet } from "./client";

export async function getInvoice(orderId: string) {
  return anGet(`/api/invoice/${orderId}`);
}

export async function getPackingSlip(orderId: string) {
  return anGet(`/api/packing-slip/${orderId}`);
}

export async function getShippingLabel(orderId: string) {
  return anGet(`/api/shipping-label/${orderId}`);
}
