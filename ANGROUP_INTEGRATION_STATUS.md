# Native ↔ ANgroup Integration Status

This documents what it takes to point this frontend at the real ANgroup
backend instead of the mock server. Read this before flipping
`NEXT_PUBLIC_AN_API` to ANgroup's URL for real traffic.

## The big picture

ANgroup is a full multi-business ERP (finance, inventory, GST, employees,
logistics, vendor procurement, AI content tools, etc.) — not a
purpose-built storefront backend. "Native" is one business tenant inside
it (`Business._id` = `6a4abddcf35feedb2392f556`, same id hardcoded as
`NATIVE_BUSINESS_ID` in ANgroup's `services/order.service.ts` and
`DEFAULT_BUSINESS_ID` in `api/contact/route.ts`).

## What you need to set

```
NEXT_PUBLIC_AN_API=<ANgroup's live deployment URL>
NEXT_PUBLIC_AN_BUSINESS_ID=6a4abddcf35feedb2392f556
```

`lib/an-sdk/client.ts` attaches `NEXT_PUBLIC_AN_BUSINESS_ID` as both a
query param and an `x-business-id` header automatically, and sends
`credentials: "include"` on every request (ANgroup's auth is an httpOnly
cookie, `an_token`, verified by its own `middleware.ts`).

## CORS — already configured, nothing to do here

ANgroup's `middleware.ts` (`CORS_ALLOWED_ORIGINS`) already allow-lists
`https://shopnative.in` / `https://www.shopnative.in` with
`Access-Control-Allow-Credentials: true`, plus any `localhost:*` origin
outside production. This was the real blocker documented in an earlier
version of this file — it's resolved in code; verify only that the
deployed origin actually matches one of these exactly (CORS origin
matching is exact-string, not a pattern).

## Every route this frontend needs now exists in ANgroup

An earlier version of this document listed public product/category
browsing, reviews, wishlist, newsletter signup, and password reset as
missing — **all of these now exist**:

| Frontend needs | ANgroup route |
|---|---|
| Public storefront product list | `GET /api/storefront/products` |
| Public single product | `GET /api/storefront/products/[slug]` |
| Related products | `GET /api/storefront/products/[slug]/related` |
| Public category list | `GET /api/categories`, `GET /api/storefront/categories` |
| Reviews | `GET/POST /api/reviews`, `/api/reviews/[id]` |
| Wishlist | `/api/wishlist` |
| Newsletter signup | `POST /api/newsletter/subscribe` |
| Password reset | `/api/auth/reset-password` |
| Vendor-scoped self-service | `/api/vendor/{dashboard,orders,profile,staff,payout-account,statement,catalog,materials,team,invoices,settings,offline-sales,stock-adjustments}` |

`lib/an-sdk/products.ts` already targets `/api/storefront/products*`
(not the authenticated ERP inventory route at `/api/products`, which is
correctly a separate, internal-only listing) — no frontend changes
needed for any of the above.

## What's already a good match (works today, no changes needed)

- `GET /api/pincode/:pincode`
- `GET /api/blog/list`
- `POST /api/coupons/validate`
- `POST /api/vendors/apply`
- `POST /api/payment/verify` (verifies the Razorpay HMAC signature properly)
- The multi-business JWT model (`businessIds`, `activeBusinessId`,
  switch-business/exit-business)
- `POST /api/anu` (ANu chat) and `POST /api/anu/issues` (ANu Issues &
  Reports inbox, `/admin/anu-issues`) — wired from `app/anu/page.jsx` via
  `lib/an-sdk/anu.ts`.

## Practical read for today's go-live

The remaining step is a **deployment config value, not code**: set
`NEXT_PUBLIC_AN_API` in Native's actual hosting environment (Vercel/
wherever it's deployed) to ANgroup's live URL, and
`NEXT_PUBLIC_AN_BUSINESS_ID` to the id above. Once that's set, every
storefront-facing flow — browsing, cart, checkout, reviews, wishlist,
newsletter, password reset, ANu — should work against the real backend.
