import { anGet } from "./client";

export async function lookupPincode(code: string) {
  return anGet(`/api/pincode/${encodeURIComponent(code)}`);
}
