import { anGet, anPost, anPut, anDelete } from "./client";

export type ProductQuery = {
  search?: string;
  category?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  /** Multi-vendor filter — proposed, see backend-reference/MULTI_VENDOR_PROPOSAL.md */
  vendor?: string;
};

function toQueryString(params: Record<string, any> = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export async function getProducts(query: ProductQuery = {}) {
  return anGet(`/api/products${toQueryString(query)}`);
}

export async function getProductBySlug(slug: string) {
  return anGet(`/api/products/${encodeURIComponent(slug)}`);
}

export async function getRelatedProducts(slug: string, limit = 8) {
  return anGet(
    `/api/products/${encodeURIComponent(slug)}/related${toQueryString({ limit })}`
  );
}

export async function adminListProducts(query: Record<string, any> = {}) {
  return anGet(`/api/admin/products${toQueryString(query)}`);
}

export async function adminGetProduct(id: string) {
  return anGet(`/api/admin/products/${id}`);
}

export async function adminCreateProduct(payload: any) {
  return anPost("/api/admin/products", payload);
}

export async function adminUpdateProduct(id: string, payload: any) {
  return anPut(`/api/admin/products/${id}`, payload);
}

export async function adminDeleteProduct(id: string) {
  return anDelete(`/api/admin/products/${id}`);
}

export async function adminUpdateProductInline(id: string, payload: any) {
  return anPost("/api/admin/products/update", { id, ...payload });
}

export async function getReviewQueue() {
  return anGet("/api/admin/products/review");
}

export async function submitProductAction(payload: {
  id: string;
  action: "approve" | "reject" | string;
  reason?: string;
}) {
  return anPost("/api/admin/products/action", payload);
}

export async function aiReviewProduct(id: string) {
  return anPost("/api/admin/products/ai-review", { id });
}

export async function aiAutoAction(id: string) {
  return anPost("/api/admin/products/auto-action", { id });
}

export async function getAuditLog() {
  return anGet("/api/products/audit");
}

export async function getAiPriceSuggestion(payload: any) {
  return anPost("/api/products/ai-price", payload);
}

export async function generateAiContent(payload: any) {
  return anPost("/api/ai-content", payload);
}

export async function runAiCompliance(payload: any) {
  return anPost("/api/ai-compliance", payload);
}

export async function generateAiSeoMulti(payload: any) {
  return anPost("/api/ai-seo-multi", payload);
}

export async function getCategories() {
  return anGet("/api/categories");
}

export async function adminCreateCategory(payload: { name: string }) {
  return anPost("/api/admin/categories", payload);
}

export async function adminListCategoriesAdmin() {
  return anGet("/api/admin/categories");
}
