# Native — Storefront (Frontend Only)

This repo is now a **pure Next.js 14 (App Router) frontend**. There is no
database, no API route handlers, and no server-side business logic here —
all of that has moved to a separate backend service owned by the **AN
group**. This app talks to that backend exclusively through the SDK in
`lib/an-sdk/`.

## How the frontend talks to the backend

Every data call goes through `lib/an-sdk/*`:

- `lib/an-sdk/client.ts` — the core HTTP client (`anGet`/`anPost`/`anPut`/`anPatch`/`anDelete`). All of it resolves against `${NEXT_PUBLIC_AN_API}<path>`, attaches a bearer token automatically when one is stored (see below), and throws a typed `ApiError` on any non-2xx response.
- One module per domain — `auth.ts`, `products.ts`, `cart.ts`, `coupons.ts`, `orders.ts`, `payments.ts`, `shipping.ts`, `invoices.ts`, `receipts.ts`, `gst.ts`, `company.ts`, `users.ts`, `warehouse.ts`, `inventory.ts`, `blog.ts`, `contact.ts`, `upload.ts`, `reviews.ts`, `wishlist.ts`, `pincode.ts`, `vendors.ts` (multi-vendor marketplace), `sso.ts` (pluggable auth mode).

**This is the whole pluggability story — one env var, nothing else.**
Point the frontend at any backend that implements the contract by setting:

```
NEXT_PUBLIC_AN_API=https://your-an-group-backend.example.com
```

See `.env.example`. No frontend code changes are needed to switch backends
— not for staging vs. production, not for AN group's real backend vs. the
mock one described below. Until a real backend exists, every screen still
renders — failed calls are caught and shown as empty/error states rather
than crashing the app.

### Try it against a real backend today: the mock server

`mock-backend/` is a small, dependency-free Node server that implements
every endpoint in the contract with in-memory fake data — enough to run
the whole app end-to-end (browse, cart, checkout, login, admin, vendor
dashboard) before AN group's real backend exists.

```
npm run mock-backend                      # starts on http://localhost:4000
# .env.local: NEXT_PUBLIC_AN_API=http://localhost:4000
npm run dev
```

Then run the smoke test — the same test doubles as a **contract checker
for AN group's real backend** once it's ready; point it at a staging URL
and it tells you exactly which endpoints don't match the shape the
frontend expects, before you flip production over:

```
npm run smoke-test
AN_API=https://staging.angroup.example.com node mock-backend/smoke-test.js
```

See `mock-backend/README.md` for seeded test logins and details.

## What the backend needs to implement

The sibling `backend-reference/` bundle (delivered alongside this repo, not
part of it) contains:

- `API_CONTRACT.md` — every endpoint this frontend calls: method, path, auth,
  request/response shape, side effects, and which external services
  (Razorpay, Shiprocket, GST verification, Cloudinary, email/WhatsApp/
  Telegram) each one touches.
- `FRONTEND_GAPS.md` — endpoints the frontend calls that don't exist in the
  original backend yet (auth signup/reset-password, categories CRUD, blog
  list, inventory, reviews, wishlist sync, related products, etc.) — this is
  effectively the AN group's first-sprint backlog.
- The original Mongoose models, API route handlers, and business-logic
  `lib/` code (invoicing, GST, Shiprocket, order engine, PDF/receipt
  generation) as a reference implementation to port from — none of it runs
  here anymore.

## New storefront features added in this pass

- **Wishlist** (`context/WishlistContext.tsx`, `/wishlist` page) — works
  entirely client-side (localStorage) so it's instant for guests; `lib/an-sdk/wishlist.ts`
  has an optional sync endpoint for logged-in users once the backend adds it.
- **Recently viewed** (`lib/recentlyViewed.ts`, `components/RecentlyViewed.jsx`) — same
  client-side pattern, shown on the homepage and product pages.
- **Search, filters & sorting** — `components/SearchBar.jsx` +
  `components/FilterSidebar.js` drive `/products?search=&category=&sort=&minPrice=&maxPrice=`,
  which `app/products/page.js` reads and passes straight through to
  `getProducts()`.
- **Ratings & reviews** — `components/ReviewsSection.jsx` on the product page,
  backed by `lib/an-sdk/reviews.ts`.
- **Related products / cross-sell** — `components/RelatedProducts.jsx` on the
  product page and cart page, backed by `lib/an-sdk/products.ts`'s
  `getRelatedProducts()`.
- A real (if minimal) admin auth guard in `app/admin/layout.js`, replacing
  the previous no-op placeholder.

## Local development

```
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_AN_API (or point at the mock backend above)
npm run dev
```

## Switching to AN group's real backend — checklist

1. Run `AN_API=<their staging URL> node mock-backend/smoke-test.js` and fix
   any failures on their side first — it's much cheaper to catch a shape
   mismatch here than in production.
2. Set `NEXT_PUBLIC_AN_API` to their real URL in the deployment environment
   (Vercel/host env vars, not `.env.local`, which is git-ignored).
3. Decide `NEXT_PUBLIC_AUTH_MODE` — `direct` (default, works today) or
   `sso` once AN group's shared login is ready (see `AUTH_AND_SSO.md` in
   `backend-reference/` for exactly what that needs).
4. Confirm `POST /api/payment/verify` on their side actually checks the
   Razorpay signature — the original backend never did (see
   `API_CONTRACT.md`'s overview section) and the mock server doesn't either
   (it can't — that's real business logic, not a shape to mock).
5. Re-run the smoke test one more time against the real backend right
   before go-live.

## Known frontend-side quirks worth knowing about

- `context/UserContext.js` and `lib/useAuth.js` both fetch the current user
  independently (pre-existing duplication in the original codebase) — both
  now call `auth.getMe()`, but they weren't unified into one hook so as not
  to change behavior beyond the data-layer swap.
- A few admin actions call the closest matching SDK function where the old
  backend had no real route at all (categories CRUD, admin registration,
  bulk AI SEO, inventory) — see `FRONTEND_GAPS.md` for the full list. These
  fail gracefully (caught + surfaced as an error message) until the AN group
  implements them.
