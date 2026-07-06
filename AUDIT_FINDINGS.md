# Implementation Audit — Findings & Fixes

A full sweep of the frontend done alongside the SSO/multi-vendor build-out,
looking for missing wiring, dead code, and inconsistencies. Everything
below was found and fixed in this pass unless noted otherwise.

## Fixed

- **No global user session.** `context/UserContext.js` existed but was
  never wrapped around the app, and `components/Navbar.js` had
  `const user = null; // auth disabled for now` hardcoded — meaning the
  navbar could never show a logged-in state no matter what. Now
  `UserProvider` wraps the app in `app/layout.tsx`, and the navbar reads
  real session state (name, role-based links, logout).
- **No Sign Up button anywhere.** Added a prominent Sign Up button plus a
  full account menu (Profile, My Orders, Vendor Dashboard, Admin Panel,
  Logout) to the navbar, and matching links to the mobile menu.
- **`react-hot-toast` was a dependency but never mounted.** `<Toaster />`
  is now mounted once in `app/layout.tsx`.
- **`/super-admin/*` had no auth guard at all.** Anyone with the URL could
  open Create User / Category Manager. Added `app/super-admin/layout.js`
  requiring a `super_admin`-ish role, matching the pattern already used
  for `/admin`.
- **`/admin`'s own guard was too loose.** It allowed anyone whose role
  simply wasn't `"customer"` — which, now that `"vendor"` is a real role,
  would have let vendors into the admin panel. Tightened to an explicit
  admin-role allowlist.
- **`components/AdminSidebar.js` existed but was never imported anywhere**
  — every `/admin/*` page rendered with zero navigation between admin
  sections. Wired it into `app/admin/layout.js` and expanded it to cover
  every existing admin route (several — warehouse, coupons, fulfillment,
  payment settings, company info — had no nav entry before either).
- **`/verify/[id]` always rendered a hardcoded "✅ VALID"** regardless of
  the order ID in the URL. Now actually fetches the invoice and shows
  invalid state if it doesn't resolve.
- **`lib/socket.js` hardcoded a specific onrender.com deployment of the
  old backend** (`io("https://native-3u3v.onrender.com/")`). Unused
  anywhere today, but risky as-is since importing it would eagerly connect
  to someone else's old infrastructure. Now reads
  `NEXT_PUBLIC_SOCKET_URL` with a localhost fallback, matching the pattern
  already used in `app/admin/page.js`'s own socket connection.
- **`lib/seo.js` pointed at `shopnative.com`** while `app/sitemap.js` and
  `app/robots.js` both use `shopnative.in` — fixed the mismatch.
- **`app/anu/page.jsx` — an internal "ANu AI DevOps Dashboard"** that
  posted arbitrary pasted error text to a hardcoded external service
  (`native-3u3v.onrender.com/anu/analyze`) and could trigger creating
  GitHub PRs against a placeholder `"your-repo-name"` repo, with **no auth
  guard**, reachable at a public route on the live storefront. This isn't
  e-commerce functionality and doesn't belong in a customer-facing
  frontend regardless of the backend split, so it's been removed from
  this repo entirely rather than ported anywhere.
- **Missing footer/sitemap coverage.** Footer's sitemap column had no
  link to Track Order; added a "Marketplace" column (Sell on Native, My
  Orders, Wishlist, Support). `app/sitemap.js` was missing `/sell`,
  `/about`, `/contact`.
- **Role-string inconsistency.** New guard code initially assumed
  `"super-admin"` (hyphen); the codebase's own existing role picker
  (`app/super-admin/users/page.js`) actually uses `"super_admin"`
  (underscore). All new role checks now accept both, defensively.

## New (not gaps, but worth knowing about)

- `app/orders` (My Orders), `app/sell` + `app/vendor/*` (vendor onboarding
  & dashboard), `app/vendors/[id]` (public vendor storefronts),
  `app/admin/vendors` + `app/admin/business` (admin-side vendor/business
  management), and `app/auth/callback` (SSO landing page) are all
  genuinely new pages, not fixes — see `MULTI_VENDOR_PROPOSAL.md` and
  `AUTH_AND_SSO.md` in `backend-reference/` for the endpoints they expect.

## Flagged, not fixed (need your input)

- **No `public/` folder in this workspace at all** — `logo.png`,
  `fssai-logo.png`, `icons/*.svg`, `placeholder.png`/`no-image.png` are
  referenced throughout (`Navbar`, `Footer`, `ProductCard`, product pages)
  but none of those image files were part of what got staged into this
  session. This is almost certainly a staging gap rather than a real gap
  in your repo — please double-check that `public/` exists with these
  files in your actual `D:\Development\native` folder before deploying;
  if it's genuinely missing, those images will 404 everywhere.
- **`context/UserContext.js` vs `lib/useAuth.js` duplication** — both
  independently call `auth.getMe()` (pre-existing, noted in the main
  README). Left as-is per that note rather than risk changing behavior
  elsewhere, but now that `UserContext` is actually wired up app-wide,
  it'd be worth migrating `lib/useAuth.js`'s few callers over to
  `useUser()` in a follow-up pass.
- **Staff roles beyond admin/vendor/customer** (`logistics`,
  `customer_support`, `finance`, `branding`, `analytics` — all present in
  `app/super-admin/users/page.js`'s role picker) have no dedicated UI or
  route-level permissions anywhere in this frontend. Whether they need
  their own scoped views is a product decision for AN group/Native to
  make, not something guessed at here.
- **`ProductCard.js` / `ProductGrid.js` components are orphaned** — no
  page currently imports them; every product listing (`app/page.js`,
  `app/products/page.js`) inlines its own card markup instead. Not
  broken, just duplicated. Left alone rather than risk changing rendering
  behavior on a live site.
