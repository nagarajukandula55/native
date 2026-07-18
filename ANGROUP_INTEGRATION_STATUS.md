# Native ↔ ANgroup Integration Status

This documents what happened when this frontend was pointed at the real
ANgroup backend (`D:\Development\ANgroup`) instead of the mock server,
what got adapted on the frontend side, and what still doesn't work.
Read this before flipping `NEXT_PUBLIC_AN_API` at production traffic.

**Updated**: the routes this doc originally flagged as "genuine gaps —
need a route added in ANgroup" have since been built there. Only vendor
product CRUD and the businessId verification below remain open.

## The big picture

ANgroup is a full multi-business ERP (finance, inventory, GST, employees,
logistics, vendor procurement, AI content tools, etc.) — not a
purpose-built storefront backend. "Native" is one business tenant inside
it. That's a solid, coherent model, but it means requests need a
`businessId` and a few storefront-facing routes live under their own
`/api/storefront/*` tree rather than the admin-authenticated `/api/*`
tree used internally.

## What you need to set

```
NEXT_PUBLIC_AN_API=<ANgroup's URL>
NEXT_PUBLIC_AN_BUSINESS_ID=<Native's business _id inside ANgroup>
```

Every scoped ANgroup route (products, vendors, coupons, ...) needs to know
which business a request is acting as. `lib/an-sdk/client.ts` attaches
`NEXT_PUBLIC_AN_BUSINESS_ID` as both a `businessId` query param and an
`x-business-id` header on every request automatically — but **that value
has to actually exist as a `Business` record in ANgroup**. `.env.local`
currently has this set to `6a5123a8e42b06cdcdec0bcf`; an earlier working
note recorded it as `6a4abddcf35feedb2392f556` instead. **Verify against
ANgroup's own `/admin/business` list which one is Native's real, current
record before going live** — this file can't confirm that without DB
access, and pointing at a stale/wrong id will make every scoped call
behave as if Native has no products, no reviews, etc. with no obvious
error.

`client.ts` also sends `credentials: "include"` on every request, because
ANgroup's auth is an httpOnly cookie (`an_token`) verified by its own
`middleware.ts` — not purely a bearer token. For that cookie to arrive on
requests from a separately-hosted frontend, **ANgroup's CORS
configuration needs to allow this frontend's origin with credentials
enabled**. ANgroup's `src/middleware.ts` already allow-lists
`https://shopnative.in` / `https://www.shopnative.in` (plus localhost in
dev) — confirm that's still the real production domain before go-live.

## Fixed on the frontend side (no ANgroup changes needed)

- **`login()`** sends `{email, username, password}` instead of
  `{identifier, password}` — matches ANgroup's real route.
- **`signup()`** posts to `/api/auth/register` (not `/api/auth/signup`)
  and doesn't assume a token comes back — ANgroup's register route
  returns `{success, message, userId}` with no auto-login.
- **`markOrderPaid(orderId, mode)`** sends `{orderId, mode}` where `mode`
  is `"MANUAL" | "SYSTEM"`, matching ANgroup's real
  `/api/orders/mark-paid`.
- **`validateCoupon()`** also sends `orderValue` and `businessId`
  alongside `code`/`subtotal`, matching ANgroup's actual body shape.
- **Vendor self-service SDK** (`getVendorProfile`, `getVendorDashboardStats`,
  `getVendorOrders`, etc.) points at ANgroup's real `/api/vendor/*`
  (singular) paths.
- **`applyAsVendor()`** maps this form's `businessName`/`contactName`
  fields onto ANgroup's real `companyName`/`contactPerson` fields.
- **SSO**: `completeSsoCallback()` uses `requestSsoToken()` /
  `verifySsoToken()` wired to ANgroup's real `/api/sso/token` and
  `/api/sso/verify` routes (no fictional code-exchange endpoint).
- Added `switchBusiness()` / `exitBusiness()` to `auth.ts`, matching
  ANgroup's real multi-business account model.
- **Public catalog/content routes now match ANgroup's real paths**:
  `getProductBySlug` → `/api/storefront/products/:slug`,
  `getRelatedProducts` → `/api/storefront/products/:slug/related` (was
  wrongly calling `/api/products/:slug/related`, which 404s — ANgroup
  moved this under `/api/storefront/products` since Next.js doesn't allow
  two sibling dynamic route segments named differently, `[id]` vs
  `[slug]`, under the same parent), category list → `/api/categories`,
  reviews → `/api/reviews`, wishlist → `/api/wishlist`, newsletter →
  `/api/newsletter/subscribe`, password reset →
  `/api/auth/reset-password/request` + `/api/auth/reset-password`.
- **Vendor product CRUD fixed** — `getVendorProducts` /
  `createVendorProduct` / `updateVendorProduct` / `deleteVendorProduct`
  now call ANgroup's real `/api/vendor-products` (hyphenated, not nested
  under `/api/vendor/`) instead of a path that never existed.

## Still a genuine gap

| Frontend needs | ANgroup status |
|---|---|
| AI content helpers (`generateAiContent`, `runAiCompliance`, `generateAiSeoMulti`) | ANgroup has its own, differently-shaped `ai/*` routes (`caption`, `generate-captions`, `generate-image`, `providers`) — not a drop-in match. Only relevant if Native's admin/vendor tooling actually uses these; the customer-facing storefront doesn't. |

## What's already a good match (works today, no changes needed)

- `GET /api/pincode/:pincode`
- `GET /api/blog/list`
- `POST /api/coupons/validate`
- `POST /api/vendors/apply`
- `POST /api/payment/verify` — verifies the Razorpay HMAC signature
  properly.
- `GET /api/categories`, `GET /api/storefront/products`,
  `GET /api/storefront/products/:slug(/related)`, `POST /api/reviews`,
  `GET /api/reviews`, `GET/POST/DELETE /api/wishlist`,
  `POST /api/newsletter/subscribe`, `POST /api/auth/reset-password/request`,
  `POST /api/auth/reset-password`.
- The multi-business JWT model itself (`businessIds`, `activeBusinessId`,
  switch-business/exit-business).

## Practical read for go-live

The backend-route gap that used to block public product/category
browsing, reviews, wishlist, and newsletter is closed. Before flipping
`NEXT_PUBLIC_AN_API` at production traffic:

1. Confirm `NEXT_PUBLIC_AN_BUSINESS_ID` is Native's real, current
   Business `_id` (see the note above — two different values have been
   recorded at different times).
2. Confirm ANgroup's CORS allow-list still has the real production
   domain this frontend is served from.
3. Smoke-test signup/login, product browsing, add-to-cart/checkout,
   reviews, wishlist, and newsletter signup end-to-end against the real
   backend, not just the mock server — this file records what *should*
   work now, not a substitute for actually exercising it once.
