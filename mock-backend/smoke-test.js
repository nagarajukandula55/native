"use strict";

/**
 * Smoke test for whatever backend NEXT_PUBLIC_AN_API points at — the mock
 * server today, AN group's real backend once it exists. Exercises every
 * lib/an-sdk/* call path (method + path + expected response shape) so a
 * candidate backend can be validated before flipping the env var in
 * production.
 *
 * Run against the mock backend:
 *   node mock-backend/server.js &
 *   node mock-backend/smoke-test.js
 *
 * Run against a real candidate backend:
 *   AN_API=https://staging.angroup.example.com node mock-backend/smoke-test.js
 *
 * Uses only Node's built-in fetch (Node 18+) — no dependencies.
 */

const BASE = process.env.AN_API || "http://localhost:4000";

let pass = 0;
let fail = 0;
const failures = [];

async function check(name, fn) {
  try {
    await fn();
    pass += 1;
    console.log(`  ok  - ${name}`);
  } catch (err) {
    fail += 1;
    failures.push({ name, error: err.message });
    console.log(`  FAIL - ${name}: ${err.message}`);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

async function req(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function main() {
  console.log(`Smoke-testing backend at ${BASE}\n`);

  let customerToken, adminToken, vendorToken, orderId, productSlug;

  console.log("Auth");
  await check("signup creates a new user + token", async () => {
    const email = `smoke-${Date.now()}@test.local`;
    const { status, data } = await req("POST", "/api/auth/signup", {
      name: "Smoke Test",
      email,
      password: "password123",
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(data.token, "expected a token in the response");
    assert(data.user?.email === email, "expected user.email to echo back");
  });

  await check("login with seeded customer", async () => {
    const { status, data } = await req("POST", "/api/auth/login", {
      identifier: "customer@native.test",
      password: "customer123",
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(data.token, "expected a token");
    customerToken = data.token;
  });

  await check("login with seeded admin", async () => {
    const { status, data } = await req("POST", "/api/auth/login", {
      identifier: "admin@native.test",
      password: "admin123",
    });
    assert(status === 200, `expected 200, got ${status}`);
    adminToken = data.token;
  });

  await check("login with seeded vendor", async () => {
    const { status, data } = await req("POST", "/api/auth/login", {
      identifier: "vendor@native.test",
      password: "vendor123",
    });
    assert(status === 200, `expected 200, got ${status}`);
    vendorToken = data.token;
  });

  await check("login rejects bad credentials", async () => {
    const { status } = await req("POST", "/api/auth/login", {
      identifier: "customer@native.test",
      password: "wrong",
    });
    assert(status === 401, `expected 401, got ${status}`);
  });

  await check("GET /api/auth/me with token returns user", async () => {
    const { status, data } = await req("GET", "/api/auth/me", undefined, customerToken);
    assert(status === 200, `expected 200, got ${status}`);
    assert(data.user?.email === "customer@native.test", "expected the logged-in user back");
  });

  console.log("\nProducts & categories");
  await check("GET /api/products returns a product list", async () => {
    const { status, data } = await req("GET", "/api/products");
    assert(status === 200, `expected 200, got ${status}`);
    assert(Array.isArray(data.products) && data.products.length > 0, "expected a non-empty products array");
    productSlug = data.products[0].slug;
  });

  await check("GET /api/products?search= filters results", async () => {
    const { data } = await req("GET", "/api/products?search=ragi");
    assert(data.products.every((p) => p.name.toLowerCase().includes("ragi")), "expected only matching products");
  });

  await check("GET /api/products/:slug returns one product", async () => {
    const { status, data } = await req("GET", `/api/products/${productSlug}`);
    assert(status === 200, `expected 200, got ${status}`);
    assert(data.product?.slug === productSlug, "expected the requested product");
  });

  await check("GET /api/products/:slug/related returns other products", async () => {
    const { status, data } = await req("GET", `/api/products/${productSlug}/related`);
    assert(status === 200, `expected 200, got ${status}`);
    assert(Array.isArray(data.products), "expected a products array");
  });

  await check("GET /api/categories returns categories", async () => {
    const { status, data } = await req("GET", "/api/categories");
    assert(status === 200 && Array.isArray(data.categories), "expected a categories array");
  });

  console.log("\nOrders");
  await check("POST /api/orders/create makes an order", async () => {
    const { status, data } = await req(
      "POST",
      "/api/orders/create",
      { items: [{ productId: "prod_1", qty: 2 }], totalAmount: 698 },
      customerToken
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(data.order?.orderId, "expected an orderId back");
    orderId = data.order.orderId;
  });

  await check("GET /api/orders/get-by-id finds the order", async () => {
    const { status, data } = await req("GET", `/api/orders/get-by-id?orderId=${orderId}`);
    assert(status === 200, `expected 200, got ${status}`);
    assert(data.order?.orderId === orderId, "expected the same order back");
  });

  await check("GET /api/orders/get returns this customer's orders", async () => {
    const { status, data } = await req("GET", "/api/orders/get", undefined, customerToken);
    assert(status === 200, `expected 200, got ${status}`);
    assert(data.orders.some((o) => o.orderId === orderId), "expected the new order in the list");
  });

  await check("GET /api/orders/get requires auth", async () => {
    const { status } = await req("GET", "/api/orders/get");
    assert(status === 401, `expected 401 without a token, got ${status}`);
  });

  console.log("\nReviews & wishlist");
  await check("POST /api/reviews creates a review", async () => {
    const { status } = await req("POST", "/api/reviews", { productId: "prod_1", rating: 5, comment: "Great!" });
    assert(status === 200, `expected 200, got ${status}`);
  });

  await check("GET /api/reviews/summary averages ratings", async () => {
    const { data } = await req("GET", "/api/reviews/summary?productId=prod_1");
    assert(data.average === 5, `expected average 5, got ${data.average}`);
  });

  await check("POST /api/wishlist/sync + GET /api/wishlist round-trips", async () => {
    await req("POST", "/api/wishlist/sync", { items: [{ productId: "prod_1" }] }, customerToken);
    const { data } = await req("GET", "/api/wishlist", undefined, customerToken);
    assert(data.items.length === 1, "expected the synced item back");
  });

  console.log("\nCoupons");
  await check("POST /api/coupons/validate accepts a valid code", async () => {
    const { status, data } = await req("POST", "/api/coupons/validate", { code: "WELCOME10", subtotal: 500 });
    assert(status === 200 && data.valid, `expected a valid coupon, got status ${status}`);
    assert(data.discount === 50, `expected 10% of 500 = 50, got ${data.discount}`);
  });

  await check("POST /api/coupons/validate rejects below min cart", async () => {
    const { status } = await req("POST", "/api/coupons/validate", { code: "WELCOME10", subtotal: 100 });
    assert(status === 400, `expected 400, got ${status}`);
  });

  console.log("\nVendors / marketplace");
  await check("GET /api/vendors lists active vendors", async () => {
    const { status, data } = await req("GET", "/api/vendors");
    assert(status === 200 && data.vendors.length > 0, "expected at least one active vendor");
  });

  await check("GET /api/vendors/me returns the vendor's own profile", async () => {
    const { status, data } = await req("GET", "/api/vendors/me", undefined, vendorToken);
    assert(status === 200, `expected 200, got ${status}`);
    assert(data.businessName, "expected vendor profile fields at the response root");
  });

  await check("GET /api/vendors/me/stats returns dashboard numbers", async () => {
    const { status, data } = await req("GET", "/api/vendors/me/stats", undefined, vendorToken);
    assert(status === 200 && typeof data.totalOrders === "number", "expected numeric stats");
  });

  await check("GET /api/business/status reflects Native's registration", async () => {
    const { status, data } = await req("GET", "/api/business/status");
    assert(status === 200 && data.registered === true, "expected Native to show as registered");
  });

  console.log("\nAdmin");
  await check("GET /api/admin/vendors defaults to pending", async () => {
    const { status, data } = await req("GET", "/api/admin/vendors", undefined, adminToken);
    assert(status === 200 && Array.isArray(data.vendors), "expected a vendors array");
  });

  await check("GET /api/admin/orders returns all orders", async () => {
    const { status, data } = await req("GET", "/api/admin/orders", undefined, adminToken);
    assert(status === 200 && data.orders.some((o) => o.orderId === orderId), "expected the earlier order visible to admin");
  });

  console.log("\nMisc integrations");
  await check("POST /api/contact accepts a message", async () => {
    const { status } = await req("POST", "/api/contact", { name: "A", email: "a@b.com", message: "Hi" });
    assert(status === 200, `expected 200, got ${status}`);
  });

  await check("POST /api/newsletter/subscribe accepts an email", async () => {
    const { status } = await req("POST", "/api/newsletter/subscribe", { email: "a@b.com" });
    assert(status === 200, `expected 200, got ${status}`);
  });

  await check("GST validate rejects a malformed number", async () => {
    const { data } = await req("POST", "/api/gst/validate", { gstNumber: "not-a-gst" });
    assert(data.valid === false, "expected an invalid GST number to be rejected");
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) {
    console.log("\nFailures:");
    failures.forEach((f) => console.log(`  - ${f.name}: ${f.error}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Smoke test crashed:", err);
  process.exit(1);
});
