import { anPost } from "./client";

export async function validateGst(gstin: string) {
  return anPost("/api/gst/validate", { gstin });
}

export async function verifyGst(gstin: string) {
  return anPost("/api/gst/verify", { gstin });
}
