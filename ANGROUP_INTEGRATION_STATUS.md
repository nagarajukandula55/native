# Native ↔ ANgroup Integration Status

This documents exactly what happened when we pointed this frontend at the
real ANgroup backend (`D:\Development\ANgroup`) instead of the mock server,
what got adapted on the frontend side, and — most importantly — **what
genuinely does not work yet** because the route doesn't exist in ANgroup.
Read this before flipping `NEXT_PUBLIC_AN_API` to ANgroup's URL for real
traffic.

## The big picture

ANgroup is a full multi-business ERP (finance, inventory, GST, employees,
logistics, vendor procurement, AI content tools, etc.) — not a
purpose-built storefront backend. "Native" is meant to be **one business
tenant** inside it. That's a solid, coherent model for where this is
headed, but it means two structural things had to be bridged on the
frontend side, and a few storefront-specific routes simply don't exist in
ANgroup today.

## What you need to set

```
NEXT_PUBLIC_AN_API=<ANgroup's URL>
NEXT_PUBLIC_AN_BUSINESS_ID=<Native's business _id inside ANgroup>
```

Every scoped ANgroup route (products, vendors, coupons, ...) needs to know
which business a request is acting as. `lib/an-sdk/client.ts` now attaches
`NEXT_PUBLIC_AN_BUSINESS_ID` as both a `businessId` query param and an
`x-business-id` header on every request automatically — but **that value
has to actually exist as a `Business` record in ANgroup first**. If Native
doesn't have a business record there yet, someone needs to create one
(via ANgroup's own admin, or `POST /api/businesses/create`) before this
value means anything.

`client.ts` also now sends `credentials: "include"` on every request,
because ANgroup's auth is an httpOnly cookie (`an_token`) verified by its
own `middleware.ts` — not purely a bearer token. For that cookie to
actually arrive on requests from a separately-hosted frontend, **ANgroup's
CORS configuration needs to allow this frontend's origin with credentials
enabled** (`Access-Control-Allow-Origin: <exact origin>` +
`Access-Control-Allow-Credentials: true` — not a wildcard origin, which
cookies won't work with). If that's not configured on ANgroup's side yet,
login/session calls will silently fail to persist across requests even
though the login call itself returns 200.

## Fixed on the frontend side (no ANgroup changes needed)

- **`login()`** now sends `{email, username, password}` instead of
  `{identifier, password}` — matches ANgroup's real route.
- **`signup()`** now posts to `/api/auth/register` (not `/api/auth/signup`)
  and no longer assumes a token comes back — ANgroup's register route
  returns `{success, message, userId}` with no auto-login.
- **`markOrderPaid(orderId, mode)`** now sends `{orderId, mode}` where
  `mode` is `"MANUAL" | "SYSTEM"`, matching ANgroup's real
  `/api/orders/mark-paid` — the three admin screens that used to call a
  UTR-based `markPaid()` now call this instead.
- **`validateCoupon()`** now also sends `orderValue` and `businessId`
  alongside the original `code`/`subtotal` fields, matching ANgroup's
  actual body shape.
- **Vendor self-service SDK** (`getVendorProfile`, `getVendorDashboardStats`,
  `getVendorOrders`, etc.) now points at ANgroup's real `/api/vendor/*`
  (singular) paths instead of the originally-proposed `/api/vendors/me/*`.
- **`applyAsVendor()`** now maps our form's `businessName`/`contactName`
  fields onto ANgroup's real `companyName`/`contactPerson` fields.
- **SSO**: `completeSsoCallback()` no longer tries a fictional
  `/api/auth/sso/exchange` code-exchange call — ANgroup doesn't have one.
  Added `requestSsoToken()` and `verifySsoToken()` wired to ANgroup's real
  `/api/sso/token` and `/api/sso/verify` routes instead.
- Added `switchBusiness()` / `exitBusiness()` to `auth.ts`, matching
  ANgroup's real multi-business account model.

## Genuine gaps — these need a route added in ANgroup, not a frontend fix

Nothing on the frontend can paper over a route that doesn't exist. These
will fail (404 or empty) against ANgroup until built there:

| Frontend needs | ANgroup status |
|---|---|
| `GET /api/categories` (public category list) | **Not found.** Homepage category grid and product filters will show empty until this exists. |
| `GET /api/products/:slug` (single product page) | **Not found.** Only the bare list route exists. |
| `GET /api/products/:slug/related` | **Not found.** |
| `GET /api/products` as a **public, unauthenticated** storefront catalog | ANgroup's version is an authenticated, business-scoped **internal ERP inventory list** with different fields (`sku`, `basePrice`, `hsn`, `reorderLevel` vs. storefront's `images`, `pricing.sellingPrice`, `variants`). A logged-out visitor browsing products will get a 401. |
| `/api/reviews*` | **Not found anywhere in ANgroup.** |
| `/api/wishlist*` | **Not found anywhere in ANgroup.** |
| `POST /api/newsletter/subscribe` | **Not found.** |
| `POST /api/auth/reset-password/request` + `POST /api/auth/reset-password` | **Not found.** |
| Vendor-scoped product CRUD (`getVendorProducts`/`createVendorProduct`/etc.) | No confirmed `/api/vendor/products` route in ANgroup — only `dashboard`, `orders`, `profile`, `staff`, `payout-account`, `statement` were confirmed present. |
| AI content helpers (`generateAiContent`, `runAiCompliance`, `generateAiSeoMulti`) | ANgroup has its own, differently-shaped `ai/*` routes (`caption`, `generate-captions`, `generate-image`, `providers`) — not a drop-in match. |

## What's already a good match (works today, no changes needed)

- `GET /api/pincode/:pincode`
- `GET /api/blog/list`
- `POST /api/coupons/validate` (path — field shape was the fix above)
- `POST /api/vendors/apply` (path + now field-mapped)
- `POST /api/payment/verify` — and this one is a genuine improvement over
  the old backend: ANgroup actually verifies the Razorpay HMAC signature
  properly, instead of unconditionally marking orders paid.
- The multi-business JWT model itself (`businessIds`, `activeBusinessId`,
  switch-business/exit-business) is a clean foundation for the "Native as
  one business under ANgroup" structure — it just needed the frontend to
  learn about `businessId`, which is now done.

## Practical read for today's go-live

If you point `NEXT_PUBLIC_AN_API` at ANgroup right now: login/signup/
orders/payment-verify/coupons/vendor-apply/pincode/blog should work (once
CORS + businessId are set up as above). **Public product browsing,
category browsing, reviews, wishlist, and newsletter will not work** until
those routes exist in ANgroup — this is a real backend gap, not something
fixable from the frontend. If today's go-live needs those to work, the
mock backend remains the safer choice for the storefront-facing parts
while ANgroup's team builds out the missing routes using this document
(and the fuller technical audit that produced it) as the punch list.
