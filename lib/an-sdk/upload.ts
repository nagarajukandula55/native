import { getToken, ApiError } from "./client";

const AN_API = process.env.NEXT_PUBLIC_AN_API || "";

export async function uploadImage(file: File, sku?: string) {
  const form = new FormData();
  form.append("file", file);
  if (sku) form.append("sku", sku);

  const token = getToken();

  const res = await fetch(`${AN_API}/api/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data?.error || data?.message || "Upload failed", res.status, data);
  }

  return data;
}
