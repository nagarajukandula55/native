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
  /** Which channel's products to fetch (see angroup's src/lib/productChannels.ts).
   * Defaults to "native" in getProducts() below — override only for a
   * deliberately different listing. */
  channel?: string;
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

/**
 * ANgroup's real storefront API returns each product's mongo id as `id`,
 * but every page/component in this frontend (HomeClient, ProductsPageClient,
 * RelatedProducts, CartContext, WishlistButton, ...) was written against an
 * older shape expecting `_id`/`mongoId`/`productKey` — none of which the
 * real API ever sends. That silently broke "Add to Cart" and product links
 * for every real product (the id resolved to undefined and the handler
 * no-op'd). Rather than hunt down and patch every call site individually,
 * normalize once here so the rest of the app keeps working unmodified.
 */
function normalizeProduct(p: any) {
  if (!p || typeof p !== "object") return p;
  const id = p.id || p._id || p.mongoId;
  return {
    ...p,
    id,
    _id: id,
    mongoId: id,
    productKey: p.productKey || p.sku || id,
  };
}

function normalizeProductList(payload: any) {
  if (!payload) return payload;
  const list = payload.products || payload.data;
  if (Array.isArray(list)) {
    const normalized = list.map(normalizeProduct);
    if (payload.products) return { ...payload, products: normalized };
    return { ...payload, data: normalized };
  }
  return payload;
}

/**
 * ANgroup now has a dedicated PUBLIC, unauthenticated storefront catalog
 * at GET /api/storefront/products (businessId/category/search/page/limit)
 * — deliberately separate from the authenticated ERP inventory listing at
 * GET /api/products, which 401s for logged-out visitors and returns
 * internal fields (sku/basePrice/hsn/reorderLevel). sort/minPrice/maxPrice/
 * vendor aren't read server-side yet (harmless no-ops there).
 */
export async function getProducts(query: ProductQuery = {}) {
  // ANgroup can back several websites/marketplaces off one product catalog
  // now (a product opts into one or more "channels" -- see
  // angroup's src/lib/productChannels.ts). This SDK only ever serves the
  // Native storefront, so it always asks for the "native" channel unless a
  // caller deliberately overrides it.
  const data = await anGet(
    `/api/storefront/products${toQueryString({ channel: "native", ...query })}`
  );
  return normalizeProductList(data);
}

/**
 * Public single-product page — GET /api/storefront/products/:slug
 * (businessId-scoped). Returns real SEO fields (metaTitle, metaDescription,
 * keywords, canonicalSlug) alongside the product data — see
 * ANgroup's src/app/api/storefront/products/[slug]/route.ts.
 */
export async function getProductBySlug(slug: string) {
  const data = await anGet(
    `/api/storefront/products/${encodeURIComponent(slug)}${toQueryString({ channel: "native" })}`
  );
  return data?.product ? { ...data, product: normalizeProduct(data.product) } : normalizeProduct(data);
}

/**
 * Same-category cross-sell rail — GET /api/storefront/products/:slug/related
 * (moved there in ANgroup since Next.js won't allow sibling dynamic
 * segments named differently under the same route -- [id] vs [slug] both
 * under /api/products broke the whole app's build). This was still
 * calling the old /api/products/:slug/related path, which 404s.
 */
export async function getRelatedProducts(slug: string, limit = 8) {
  const data = await anGet(
    `/api/storefront/products/${encodeURIComponent(slug)}/related${toQueryString({ limit, channel: "native" })}`
  );
  return normalizeProductList(data);
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

/**
 * Public storefront category list — GET /api/categories (businessId-scoped,
 * derives distinct NativeProduct.category values). No auth required.
 */
export async function getCategories() {
  // Now returns only categories with at least one live "native"-channel
  // product (see api/categories/route.ts) -- auto-updates as products are
  // added/approved/removed, no separate sync needed.
  return anGet(`/api/categories${toQueryString({ channel: "native" })}`);
}

export async function adminCreateCategory(payload: { name: string }) {
  return anPost("/api/admin/categories", payload);
}

export async function adminListCategoriesAdmin() {
  return anGet("/api/admin/categories");
}
