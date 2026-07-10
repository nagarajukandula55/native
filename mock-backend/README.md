# Mock AN-Group Backend

A throwaway, dependency-free backend that implements every endpoint this
frontend calls (see `lib/an-sdk/*`). Its only purpose is to prove — today,
before AN group's real backend exists — that the frontend's "backend is
fully pluggable" design actually works end-to-end, and to give you
something to develop and demo against in the meantime.

## Run it

```
npm run mock-backend
# or: node mock-backend/server.js
```

Starts on `http://localhost:4000` (override with `MOCK_PORT`). Then point
the frontend at it:

```
# .env.local
NEXT_PUBLIC_AN_API=http://localhost:4000
```

Seeded logins (see `mock-backend/data.js`):

| Role | Email | Password |
|---|---|---|
| Admin | admin@native.test | admin123 |
| Vendor | vendor@native.test | vendor123 |
| Customer | customer@native.test | customer123 |

## Verify it (or verify a real candidate backend)

```
npm run smoke-test
# or against a real backend once AN group has one:
AN_API=https://staging.angroup.example.com node mock-backend/smoke-test.js
```

This hits ~30 endpoints across auth, products, orders, reviews, wishlist,
coupons, vendors, and admin, asserting the response shapes match exactly
what `lib/an-sdk/*` expects. Run it against any candidate backend before
flipping `NEXT_PUBLIC_AN_API` in production — it's the fastest way to know
whether a new backend actually satisfies the contract or just looks close.

Two real ordering bugs were caught by this test while building it (see
`server.js`'s comments above the orders and admin/products route blocks) —
that's exactly the kind of mistake this is meant to catch before it reaches
a real environment.

## What this is not

- Not persistent — all data resets when the process restarts (in-memory only).
- Not secure — passwords aren't hashed, tokens are just random strings with
  no expiry, and there's no rate limiting or input validation beyond what's
  needed to keep the frontend working.
- Not a reference for business logic — for that, see
  `backend-reference/API_CONTRACT.md` (the real, original backend logic)
  and `backend-reference/MULTI_VENDOR_PROPOSAL.md` /
  `backend-reference/AUTH_AND_SSO.md` (the new proposed contracts).
- Payment/shipping/GST calls are stubbed (always "succeed") — this is
  purely for exercising the frontend's request/response wiring, not for
  testing real payment or logistics integration.

## Adding new endpoints

If you add a new `lib/an-sdk/*` function, add a matching route in
`server.js` and a corresponding check in `smoke-test.js` in the same pass —
that's what keeps this useful as the contract grows.
