"use strict";

/**
 * Mock AN-group backend.
 *
 * This is a throwaway, in-memory implementation of every endpoint listed
 * in backend-reference/API_CONTRACT.md, FRONTEND_GAPS.md,
 * MULTI_VENDOR_PROPOSAL.md, and AUTH_AND_SSO.md — i.e. everything
 * lib/an-sdk/* in the frontend actually calls. Its only job is to prove
 * the frontend's "backend is fully pluggable via NEXT_PUBLIC_AN_API" claim
 * end-to-end: point the frontend at this instead of a real backend and
 * every screen should work against real (if fake) data.
 *
 * NOT for production. No real persistence (resets on restart), no real
 * password hashing, no real payment/shipping/GST calls (all stubbed),
 * fake bearer tokens. When AN group's real backend is ready, swap
 * NEXT_PUBLIC_AN_API to point at it — nothing else changes on the
 * frontend, which is exactly the point of this exercise.
 *
 * Run: node mock-backend/server.js  (or `npm run mock-backend`)
 * Then set NEXT_PUBLIC_AN_API=http://localhost:4000 in your frontend .env.local.
 */

const http = require("http");
const crypto = require("crypto");
const db = require("./data");

const PORT = process.env.MOCK_PORT || 4000;

/* ============================================================
   TINY ROUTER — no framework, just enough to route method+path
============================================================ */

const routes = []; // { method, pattern: RegExp, keys: [...], handler }

function addRoute(method, path, handler) {
  const keys = [];
  const pattern = new RegExp(
    "^" +
      path
        .replace(/:[a-zA-Z]+/g, (m) => {
          keys.push(m.slice(1));
          return "([^/]+)";
        })
        .replace(/\//g, "\\/") +
      "$"
  );
  routes.push({ method, pattern, keys, handler });
}

function get(path, handler) {
  addRoute("GET", path, handler);
}
function post(path, handler) {
  addRoute("POST", path, handler);
}
function put(path, handler) {
  addRoute("PUT", path, handler);
}
function patch(path, handler) {
  addRoute("PATCH", path, handler);
}
function del(path, handler) {
  addRoute("DELETE", path, handler);
}

/* ============================================================
   HELPERS
============================================================ */

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(payload);
}

function ok(res, body) {
  send(res, 200, { success: true, ...body });
}

function fail(res, status, message) {
  send(res, status, { success: false, message });
}

function getBearer(req) {
  const header = req.headers["authorization"] || "";
  const match = header.match(/^Bearer (.+)$/);
  return match ? match[1] : null;
}

function getUser(req) {
  const token = getBearer(req);
  if (!token) return null;
  const userId = db.tokens.get(token);
  if (!userId) return null;
  return db.users.find((u) => u.id === userId) || null;
}

function requireAuth(req, res) {
  const user = getUser(req);
  if (!user) {
    fail(res, 401, "Not authenticated");
    return null;
  }
  return user;
}

function publicUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

function issueToken(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  db.tokens.set(token, userId);
  return token;
}

/* ============================================================
   AUTH
============================================================ */

post("/api/auth/login", async (req, res, body) => {
  const { identifier, password } = body;
  const user = db.users.find(
    (u) => (u.email === identifier || u.phone === identifier) && u.password === password
  );
  if (!user) return fail(res, 401, "Invalid credentials");
  ok(res, { token: issueToken(user.id), user: publicUser(user) });
});

post("/api/auth/signup", async (req, res, body) => {
  const { name, email, phone, password } = body;
  if (!name || !email || !password) return fail(res, 400, "Missing required fields");
  if (db.users.some((u) => u.email === email)) return fail(res, 409, "Email already registered");
  const user = {
    id: db.nextId("user"),
    name,
    email,
    phone: phone || "",
    password,
    role: "customer",
  };
  db.users.push(user);
  ok(res, { token: issueToken(user.id), user: publicUser(user) });
});

get("/api/auth/me", async (req, res) => {
  const user = getUser(req);
  if (!user) return fail(res, 401, "Not authenticated");
  ok(res, { user: publicUser(user) });
});

post("/api/auth/reset-password/request", async (req, res, body) => {
  ok(res, { message: `If ${body.email} exists, a reset link has been sent (mock — check server logs).` });
  console.log(`[mock] password reset requested for ${body.email}`);
});

post("/api/auth/reset-password", async (req, res, body) => {
  ok(res, { message: "Password reset (mock, no-op)." });
});

post("/api/auth/sso/exchange", async (req, res, body) => {
  // Mock SSO: any non-empty code "exchanges" for the seeded customer.
  if (!body.code) return fail(res, 400, "Missing code");
  const user = db.users.find((u) => u.id === "user_customer");
  ok(res, { token: issueToken(user.id), user: publicUser(user) });
});

/* ============================================================
   PRODUCTS (storefront)
============================================================ */

get("/api/products", async (req, res, body, params, query) => {
  let list = db.products.slice();
  if (query.search) {
    const q = query.search.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q));
  }
  if (query.category) list = list.filter((p) => p.category === query.category);
  if (query.vendor) list = list.filter((p) => p.vendor && p.vendor.id === query.vendor);
  if (query.minPrice) list = list.filter((p) => p.displayPrice >= Number(query.minPrice));
  if (query.maxPrice) list = list.filter((p) => p.displayPrice <= Number(query.maxPrice));
  if (query.sort === "price_asc") list.sort((a, b) => a.displayPrice - b.displayPrice);
  if (query.sort === "price_desc") list.sort((a, b) => b.displayPrice - a.displayPrice);
  ok(res, { products: list });
});

get("/api/products/:slug/related", async (req, res, body, params) => {
  const related = db.products.filter((p) => p.slug !== params.slug).slice(0, 4);
  ok(res, { products: related });
});

get("/api/products/:slug", async (req, res, body, params) => {
  const product = db.products.find((p) => p.slug === params.slug);
  if (!product) return fail(res, 404, "Product not found");
  ok(res, { product });
});

get("/api/categories", async (req, res) => {
  ok(res, { categories: db.categories });
});

/* ============================================================
   ADMIN PRODUCTS / CATEGORIES / AI TOOLS (stubs)
============================================================ */

// Same ordering hazard as /api/orders/* above — literal paths before the
// GET/PUT/DELETE /api/admin/products/:id catch-alls.
get("/api/admin/products", async (req, res) => ok(res, { products: db.products }));
post("/api/admin/products", async (req, res, body) => {
  const product = { _id: db.nextId("prod"), ...body };
  db.products.push(product);
  ok(res, { product });
});
post("/api/admin/products/update", async (req, res, body) => {
  const product = db.products.find((p) => p._id === body.id);
  if (!product) return fail(res, 404, "Not found");
  Object.assign(product, body);
  ok(res, { product });
});
get("/api/admin/products/review", async (req, res) => ok(res, { products: [] }));
post("/api/admin/products/action", async (req, res, body) => ok(res, { action: body.action }));
post("/api/admin/products/ai-review", async (req, res) => ok(res, { review: "Looks good (mock)." }));
post("/api/admin/products/auto-action", async (req, res) => ok(res, { action: "none" }));

// Catch-alls — must stay LAST among /api/admin/products/* routes per method.
get("/api/admin/products/:id", async (req, res, body, params) => {
  const product = db.products.find((p) => p._id === params.id);
  if (!product) return fail(res, 404, "Not found");
  ok(res, { product });
});
put("/api/admin/products/:id", async (req, res, body, params) => {
  const product = db.products.find((p) => p._id === params.id);
  if (!product) return fail(res, 404, "Not found");
  Object.assign(product, body);
  ok(res, { product });
});
del("/api/admin/products/:id", async (req, res, body, params) => {
  const idx = db.products.findIndex((p) => p._id === params.id);
  if (idx === -1) return fail(res, 404, "Not found");
  db.products.splice(idx, 1);
  ok(res, {});
});
get("/api/products/audit", async (req, res) => ok(res, { log: [] }));
post("/api/products/ai-price", async (req, res) => ok(res, { suggestedPrice: 199 }));
post("/api/ai-content", async (req, res) => ok(res, { content: "Generated description (mock)." }));
post("/api/ai-compliance", async (req, res) => ok(res, { compliant: true }));
post("/api/ai-seo-multi", async (req, res) => ok(res, { results: [] }));
post("/api/admin/categories", async (req, res, body) => {
  const category = { _id: db.nextId("cat"), ...body, type: body.type || "website" };
  db.categories.push(category);
  ok(res, { category });
});
get("/api/admin/categories", async (req, res) => ok(res, { categories: db.categories }));

/* ============================================================
   CART (server-side enrichment only — cart itself is client-side)
============================================================ */

post("/api/cart/enrich", async (req, res, body) => {
  const items = (body.items || []).map((item) => {
    const product = db.products.find((p) => p._id === item.productId);
    return { ...item, currentPrice: product?.displayPrice ?? item.price, inStock: product ? product.stock > 0 : true };
  });
  ok(res, { items });
});

/* ============================================================
   ORDERS
============================================================ */

post("/api/orders/create", async (req, res, body) => {
  const user = getUser(req);
  const order = {
    _id: db.nextId("order"),
    orderId: db.nextId("ORD"),
    userId: user?.id || null,
    items: body.items || [],
    totalAmount: body.totalAmount || 0,
    status: "PENDING_PAYMENT",
    createdAt: new Date().toISOString(),
  };
  db.orders.push(order);
  ok(res, { order });
});

// NOTE: order matters here. This tiny router matches routes in
// registration order and takes the first match, so every literal
// (non-":param") /api/orders/* path MUST be registered before the
// catch-all /api/orders/:id below — otherwise e.g. GET /api/orders/get
// would incorrectly match /api/orders/:id with id="get" and 404. The
// smoke test caught exactly this the first time this file was written.

get("/api/orders/get-by-id", async (req, res, body, params, query) => {
  const order = db.orders.find((o) => o.orderId === query.orderId || o._id === query.orderId);
  if (!order) return fail(res, 404, "Order not found");
  ok(res, { order });
});

get("/api/orders/get", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  ok(res, { orders: db.orders.filter((o) => o.userId === user.id) });
});

get("/api/orders/list", async (req, res) => {
  ok(res, { orders: db.orders });
});

get("/api/orders/timeline/:id", async (req, res, body, params) => {
  ok(res, { timeline: [{ status: "PLACED", at: new Date().toISOString() }] });
});

post("/api/orders/add-note", async (req, res, body) => {
  ok(res, { noted: true });
});

get("/api/admin/orders", async (req, res) => {
  ok(res, { orders: db.orders });
});

// Catch-all — must stay LAST among the GET /api/orders/* routes.
get("/api/orders/:id", async (req, res, body, params) => {
  const order = db.orders.find((o) => o._id === params.id || o.orderId === params.id);
  if (!order) return fail(res, 404, "Order not found");
  ok(res, { order });
});

post("/api/orders/status", async (req, res, body) => {
  const order = db.orders.find((o) => o._id === body.orderId || o.orderId === body.orderId);
  if (!order) return fail(res, 404, "Order not found");
  order.status = body.status;
  ok(res, { order });
});

post("/api/orders/update-status", async (req, res, body) => {
  const order = db.orders.find((o) => o._id === body.orderId || o.orderId === body.orderId);
  if (!order) return fail(res, 404, "Order not found");
  order.status = body.status;
  ok(res, { order });
});

post("/api/admin/orders/update-status", async (req, res, body) => {
  const order = db.orders.find((o) => o._id === body.orderId || o.orderId === body.orderId);
  if (!order) return fail(res, 404, "Order not found");
  order.status = body.status;
  ok(res, { order });
});

post("/api/orders/mark-paid", async (req, res, body) => {
  const order = db.orders.find((o) => o._id === body.orderId || o.orderId === body.orderId);
  if (!order) return fail(res, 404, "Order not found");
  order.status = "PAID";
  ok(res, { order });
});

/* ============================================================
   PAYMENTS (stub — real signature verification is a backend concern;
   see API_CONTRACT.md's note that the ORIGINAL code never checked this)
============================================================ */

post("/api/payment/mark-paid", async (req, res, body) => {
  ok(res, { marked: true });
});

post("/api/payment/verify", async (req, res, body) => {
  // Mock only: unlike the original codebase (see API_CONTRACT.md), a real
  // backend MUST verify body.razorpay_signature via HMAC before trusting
  // this. This mock exists purely to exercise the frontend call, not to
  // demonstrate correct signature verification.
  ok(res, { verified: true });
});

get("/api/admin/payment-settings", async (req, res) => {
  ok(res, { settings: db.paymentSettings });
});

post("/api/admin/payment-settings", async (req, res, body) => {
  db.setPaymentSettings(body);
  ok(res, { settings: db.paymentSettings });
});

/* ============================================================
   SHIPPING / INVOICES / RECEIPTS (stubs)
============================================================ */

post("/api/shipping/rates", async (req, res) => ok(res, { rates: [{ courier: "Mock Express", rate: 49, eta: "3-5 days" }] }));
post("/api/shipping/couriers", async (req, res) => ok(res, { couriers: ["Mock Express"] }));
post("/api/shipping/create-shipment", async (req, res, body) => ok(res, { awb: db.nextId("AWB") }));
post("/api/shipping/cancel", async (req, res) => ok(res, { cancelled: true }));
get("/api/shipping/track/:awb", async (req, res, body, params) => ok(res, { status: "IN_TRANSIT", awb: params.awb }));
get("/api/shipping/generate-label/:orderId", async (req, res) => ok(res, { url: "/mock-label.pdf" }));
post("/api/shipping/request-pickup", async (req, res) => ok(res, { scheduled: true }));

get("/api/invoice/:orderId", async (req, res, body, params) => {
  ok(res, { invoice: { invoiceNumber: `INV-${params.orderId}`, totalAmount: 349 } });
});
get("/api/packing-slip/:orderId", async (req, res) => ok(res, { url: "/mock-packing-slip.pdf" }));
get("/api/shipping-label/:orderId", async (req, res) => ok(res, { url: "/mock-shipping-label.pdf" }));
get("/api/receipt/:orderId", async (req, res, body, params) => ok(res, { receipt: { receiptNumber: `RCPT-${params.orderId}` } }));

/* ============================================================
   GST
============================================================ */

post("/api/gst/validate", async (req, res, body) => ok(res, { valid: /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/.test(body.gstNumber || "") }));
post("/api/gst/verify", async (req, res) => ok(res, { verified: true, legalName: "Mock Business Pvt Ltd" }));

/* ============================================================
   COMPANY / CONTACT / NEWSLETTER
============================================================ */

get("/api/company", async (req, res) => ok(res, { company: db.companySettings }));
post("/api/company", async (req, res, body) => {
  db.setCompanySettings(body);
  ok(res, { company: db.companySettings });
});

post("/api/contact", async (req, res, body) => {
  console.log("[mock] contact message:", body);
  ok(res, { received: true });
});

post("/api/newsletter/subscribe", async (req, res, body) => {
  console.log("[mock] newsletter subscribe:", body.email);
  ok(res, { subscribed: true });
});

/* ============================================================
   USERS / ADMIN
============================================================ */

get("/api/admin/users", async (req, res) => ok(res, { users: db.users.map(publicUser) }));
post("/api/admin/users", async (req, res, body) => {
  const user = { id: db.nextId("user"), ...body };
  db.users.push(user);
  ok(res, { user: publicUser(user) });
});
post("/api/admin/register", async (req, res, body) => {
  const user = { id: db.nextId("user"), role: "admin", ...body };
  db.users.push(user);
  ok(res, { user: publicUser(user) });
});

/* ============================================================
   WAREHOUSE / INVENTORY
============================================================ */

post("/api/warehouse/update-status", async (req, res, body) => ok(res, { updated: true }));
get("/api/inventory", async (req, res) => ok(res, { inventory: db.products.map((p) => ({ productId: p._id, stock: p.stock })) }));
post("/api/inventory", async (req, res, body) => {
  const product = db.products.find((p) => p._id === body.productId);
  if (product) product.stock = body.stock;
  ok(res, { updated: true });
});

/* ============================================================
   BLOG
============================================================ */

get("/api/blog/list", async (req, res) => ok(res, { posts: db.blogPosts }));
get("/api/blog/:slug", async (req, res, body, params) => {
  const post = db.blogPosts.find((p) => p.slug === params.slug);
  if (!post) return fail(res, 404, "Post not found");
  ok(res, { post });
});

/* ============================================================
   PINCODE
============================================================ */

get("/api/pincode/:code", async (req, res, body, params) => {
  ok(res, { pincode: params.code, city: "Bengaluru", state: "Karnataka", serviceable: true });
});

/* ============================================================
   UPLOAD
============================================================ */

post("/api/upload", async (req, res) => {
  // Real uploads go to Cloudinary server-side; mock just acknowledges.
  ok(res, { url: "/placeholder.png" });
});

/* ============================================================
   COUPONS
============================================================ */

post("/api/coupons/validate", async (req, res, body) => {
  const coupon = db.coupons.find((c) => c.code === body.code && c.active);
  if (!coupon) return fail(res, 404, "Invalid coupon code");
  if (body.subtotal < coupon.minCart) return fail(res, 400, `Minimum cart value is ₹${coupon.minCart}`);
  const discount = coupon.type === "percent" ? (body.subtotal * coupon.value) / 100 : coupon.value;
  ok(res, { valid: true, coupon, discount });
});
get("/api/coupons", async (req, res) => ok(res, { coupons: db.coupons }));
post("/api/coupons/create", async (req, res, body) => {
  const coupon = { _id: db.nextId("coupon"), usedCount: 0, usedBy: [], active: true, ...body };
  db.coupons.push(coupon);
  ok(res, { coupon });
});
patch("/api/coupons/toggle", async (req, res, body) => {
  const coupon = db.coupons.find((c) => c._id === body.id);
  if (!coupon) return fail(res, 404, "Not found");
  coupon.active = !coupon.active;
  ok(res, { coupon });
});
del("/api/coupons/delete", async (req, res, body) => {
  const idx = db.coupons.findIndex((c) => c._id === body.id);
  if (idx !== -1) db.coupons.splice(idx, 1);
  ok(res, {});
});

/* ============================================================
   REVIEWS
============================================================ */

get("/api/reviews", async (req, res, body, params, query) => {
  ok(res, { reviews: db.reviews.filter((r) => r.productId === query.productId) });
});
get("/api/reviews/summary", async (req, res, body, params, query) => {
  const productReviews = db.reviews.filter((r) => r.productId === query.productId);
  const avg = productReviews.length
    ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
    : 0;
  ok(res, { average: avg, count: productReviews.length });
});
post("/api/reviews", async (req, res, body) => {
  const review = { _id: db.nextId("review"), createdAt: new Date().toISOString(), ...body };
  db.reviews.push(review);
  ok(res, { review });
});

/* ============================================================
   WISHLIST
============================================================ */

get("/api/wishlist", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  ok(res, { items: db.wishlists.get(user.id) || [] });
});
post("/api/wishlist/sync", async (req, res, body) => {
  const user = requireAuth(req, res);
  if (!user) return;
  db.wishlists.set(user.id, body.items || []);
  ok(res, { synced: true });
});

/* ============================================================
   VENDORS (multi-vendor marketplace — see MULTI_VENDOR_PROPOSAL.md)
============================================================ */

post("/api/vendors/apply", async (req, res, body) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const vendor = { _id: db.nextId("vendor"), status: "pending", ...body };
  db.vendors.push(vendor);
  user.vendorId = vendor._id;
  ok(res, { vendor });
});
get("/api/vendors/me/status", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const vendor = db.vendors.find((v) => v._id === user.vendorId);
  ok(res, { status: vendor ? vendor.status : null });
});
get("/api/vendors/me", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const vendor = db.vendors.find((v) => v._id === user.vendorId);
  if (!vendor) return fail(res, 404, "Not a vendor");
  ok(res, vendor);
});
put("/api/vendors/me", async (req, res, body) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const vendor = db.vendors.find((v) => v._id === user.vendorId);
  if (!vendor) return fail(res, 404, "Not a vendor");
  Object.assign(vendor, body);
  ok(res, vendor);
});
get("/api/vendors/me/stats", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  ok(res, { totalOrders: 12, revenue: 4580, productCount: db.products.filter((p) => p.vendor?.id === user.vendorId).length, pendingPayout: 890 });
});
get("/api/vendors/me/products", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  ok(res, { products: db.products.filter((p) => p.vendor?.id === user.vendorId) });
});
post("/api/vendors/me/products", async (req, res, body) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const product = { _id: db.nextId("prod"), vendor: { id: user.vendorId, name: user.name }, ...body };
  db.products.push(product);
  ok(res, { product });
});
put("/api/vendors/me/products/:id", async (req, res, body, params) => {
  const product = db.products.find((p) => p._id === params.id);
  if (!product) return fail(res, 404, "Not found");
  Object.assign(product, body);
  ok(res, { product });
});
del("/api/vendors/me/products/:id", async (req, res, body, params) => {
  const idx = db.products.findIndex((p) => p._id === params.id);
  if (idx !== -1) db.products.splice(idx, 1);
  ok(res, {});
});
get("/api/vendors/me/orders", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  ok(res, { orders: db.orders });
});
post("/api/vendors/me/orders/:orderId/status", async (req, res, body, params) => {
  const order = db.orders.find((o) => o._id === params.orderId || o.orderId === params.orderId);
  if (order) order.status = body.status;
  ok(res, { order });
});
get("/api/vendors/me/payouts", async (req, res) => {
  ok(res, { payouts: [{ _id: "payout_1", amount: 890, status: "pending" }] });
});

get("/api/vendors/:idOrSlug/products", async (req, res, body, params) => {
  ok(res, { products: db.products.filter((p) => p.vendor && (p.vendor.id === params.idOrSlug)) });
});
get("/api/vendors/:idOrSlug", async (req, res, body, params) => {
  const vendor = db.vendors.find((v) => v._id === params.idOrSlug || v.slug === params.idOrSlug);
  if (!vendor) return fail(res, 404, "Vendor not found");
  ok(res, { vendor });
});
get("/api/vendors", async (req, res) => {
  ok(res, { vendors: db.vendors.filter((v) => v.status === "active") });
});

get("/api/admin/vendors", async (req, res, body, params, query) => {
  const status = query.status || "pending";
  ok(res, { vendors: db.vendors.filter((v) => v.status === status) });
});
get("/api/admin/vendors/:id", async (req, res, body, params) => {
  const vendor = db.vendors.find((v) => v._id === params.id);
  if (!vendor) return fail(res, 404, "Not found");
  ok(res, { vendor });
});
post("/api/admin/vendors/:id/approve", async (req, res, body, params) => {
  const vendor = db.vendors.find((v) => v._id === params.id);
  if (!vendor) return fail(res, 404, "Not found");
  vendor.status = "active";
  ok(res, { vendor });
});
post("/api/admin/vendors/:id/reject", async (req, res, body, params) => {
  const vendor = db.vendors.find((v) => v._id === params.id);
  if (!vendor) return fail(res, 404, "Not found");
  vendor.status = "rejected";
  ok(res, { vendor });
});
post("/api/admin/vendors/:id/suspend", async (req, res, body, params) => {
  const vendor = db.vendors.find((v) => v._id === params.id);
  if (!vendor) return fail(res, 404, "Not found");
  vendor.status = "suspended";
  ok(res, { vendor });
});
post("/api/admin/vendors/:id/reinstate", async (req, res, body, params) => {
  const vendor = db.vendors.find((v) => v._id === params.id);
  if (!vendor) return fail(res, 404, "Not found");
  vendor.status = "active";
  ok(res, { vendor });
});

get("/api/business/status", async (req, res) => ok(res, db.business));
post("/api/business/register", async (req, res, body) => {
  Object.assign(db.business, { registered: true, status: "pending", ...body });
  ok(res, db.business);
});
put("/api/business/settings", async (req, res, body) => {
  Object.assign(db.business, body);
  ok(res, db.business);
});

/* ============================================================
   HEALTH CHECK — this is what you'll see if you open the mock
   backend's URL directly in a browser (e.g. http://localhost:4000).
   That's expected; the mock backend has no pages of its own. The
   actual site is the Next.js frontend at http://localhost:3000 —
   this server is just the API it talks to in the background.
============================================================ */

get("/", async (req, res) => {
  ok(res, {
    message:
      "Mock AN-group backend is running. This URL itself has no page — " +
      "open the frontend at http://localhost:3000 instead (with " +
      "NEXT_PUBLIC_AN_API pointed at this server's URL).",
    seededLogins: [
      "admin@native.test / admin123",
      "vendor@native.test / vendor123",
      "customer@native.test / customer123",
    ],
    tryInstead: "GET /api/products",
  });
});

/* ============================================================
   SERVER
============================================================ */

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    return send(res, 204, {});
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const query = Object.fromEntries(url.searchParams.entries());

  const match = routes.find((r) => r.method === req.method && r.pattern.test(pathname));

  if (!match) {
    return fail(
      res,
      404,
      `No mock route for ${req.method} ${pathname}. If you're trying to check the server is up, visit GET / instead — every real route starts with /api/...`
    );
  }

  const execMatch = match.pattern.exec(pathname);
  const params = {};
  match.keys.forEach((key, i) => (params[key] = decodeURIComponent(execMatch[i + 1])));

  const body = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) ? await readBody(req) : {};

  try {
    await match.handler(req, res, body, params, query);
  } catch (err) {
    console.error(`[mock] error handling ${req.method} ${pathname}:`, err);
    fail(res, 500, "Mock server error");
  }
});

server.listen(PORT, () => {
  console.log(`Mock AN-group backend running at http://localhost:${PORT}`);
  console.log(`Point the frontend at it with NEXT_PUBLIC_AN_API=http://localhost:${PORT}`);
  console.log(`Seeded logins: admin@native.test / admin123, vendor@native.test / vendor123, customer@native.test / customer123`);
});

module.exports = server;
