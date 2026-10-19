# Native and Native Admin system review

## Fixes applied after review — 19 October 2026

The findings below describe the original audit. The following changes now exist locally in Native and Native Admin:

- Removed privileged invoice generation from the storefront. Invoice lookup uses the customer's bearer token, verifies their session and checks order ownership; it no longer uses an admin service key. Generic product invoices open through Native's invoice page. Other order types retain their receipt links.
- Disabled shared caching for private requests and all server-side calls. Public-cache invalidation also prevents older in-flight requests from restoring stale data after writes/account changes. Session loading ignores results from previous accounts.
- Connected checkout to a same-origin proxy for Native Admin's StoreSettings, the source used by backend charging. Checkout blocks payment if settings cannot be confirmed. Public GET pricing and service-key-authenticated POST numbering reach their handlers; settings writes remain protected.
- Corrected vendor application identity/tax fields, status endpoint, response mapping and capability checks. Login/signup honor safe local return paths; approved vendor accounts can reach the Native vendor portal. The backend's vendor portal setting and approval process still apply.
- Staff sessions revalidate current account activity, role and session version against the authoritative backend. Executive sessions verify their cookie, local active account/profile and current session version. Older admin routes now also perform live session checks. Forged identity headers cannot create a session. Existing executive sessions must sign in again after rollout.
- Migrated Native Admin middleware to the supported `proxy.ts` convention. API paths containing dots remain protected. Added API deadlines and removed Native's unsupported build configuration.
- Added real 192px icons; customer, shop, vendor, staff admin and executive manifests have distinct launch identities. Workers serve the offline page for failed navigations, avoid caching live/private APIs and preserve unrelated caches. Executive/staff worker registration runs from shared app initialization. Install buttons no longer offer an inactive action.
- Added Native shop identity, local cookie logout, accurate empty/error states and Native shop links. Checkout presentation now uses Native; business JSON embedded in HTML escapes `<`.

Validation: both default production builds passed after allowing required local build/filesystem/network access; both TypeScript checks passed; 14 regression tests passed (`npm run test:system` in each repository: 9 Native, 5 admin). Focused lint on the authentication/proxy/install code passed. Every icon referenced by all five manifests exists and has matching pixel dimensions. Existing duplicate Mongoose index warnings remain non-blocking.

Production has not been deployed or acceptance-tested. Local HTTP smoke probes were blocked/timed out in this environment, so browser installation, login, handover, payments and actual push delivery still require a post-deployment test. These limitations do not negate the passing build and isolated regression checks.

Rollout: deploy Native Admin first, then Native. Native's server-side `NATIVE_ADMIN_API_URL` defaults to `https://admin.shopnative.in`; configure it for a different environment. The existing admin internal-key pair must match for document numbering. Recheck fee changes, an admin-created shop login, approved vendor/team login, disabled-account rejection, customer account switching and invoice ownership. Test installation/update/offline on Android and iOS.

External setup still needed: native Android push remains deliberately disabled until Firebase is configured and device tokens have a backend registration/send flow. Executive notification display support does not by itself establish subscription/delivery. Real payment and notification tests require configured accounts/devices and have not been simulated as successful.

---

Date: 19 October 2026. Scope: the two local projects, with selected shared-backend source reads to verify API contracts. This is a code and build review, not a completed production acceptance test. No production records were changed and no payments or messages were sent.

## Validation

- Native TypeScript: passed.
- Native Admin TypeScript: passed.
- Native production build: passed, including the new shop routes. Warnings: unsupported `serverExternalPackages` configuration in Next 14; caught dynamic-render messages for banner fetching.
- Native Admin default production build: failed while Turbopack tried to launch its CSS processing child process. A Webpack retry failed with EPERM while creating `.next/server/app/api/masters/units`. These are local execution/filesystem failures; they do not establish a production code defect. Admin build success remains unverified.
- Both manifests parse, every referenced PNG exists, and its actual dimensions match the declared dimensions.
- Three isolated, network-free reproductions confirmed middleware blocks on pricing and numbering, and profile cache reuse across accounts.
- Attempts to read production storefront/admin pages and manifests failed with DNS/access/timeout errors from this environment. Production HTTPS, redirects, cookies, browser installation, push delivery and authenticated workflows remain unverified. This does not establish that the sites are down.
- Existing mock smoke tests were inspected but not run against production: they create accounts/orders and still assume older paths such as `/api/auth/signup`.

## Highest priority findings

### 1. Public invoice proxies forward privileged requests without customer authorization

Evidence: `app/api/invoice/generate/route.ts` and `app/api/my-orders/invoices/route.ts` accept a request body and forward `ADMIN_SERVICE_KEY` without authenticating a customer or checking order ownership. The corresponding shared-backend routes authorize the service key and scope to Native's business, not to the individual customer. Invoice lookup returns invoice numbers and URLs; generation can create/render/upload an invoice and update an order.

Impact: when the service key is configured, knowing another Native order identifier is sufficient to attempt privileged invoice operations through the public storefront. Hiding a route from the UI does not restrict access.

Recommendation: disable the unused generation proxy, or require an authorized admin. For customer lookup, validate a real customer session and independently constrain requested orders to that customer before using a service credential. Preserve secure guest receipt access through an explicit scoped token if needed.

### 2. Customer cache survives account changes

Evidence: `lib/an-sdk/client.ts` keys its GET cache and in-flight requests solely by endpoint. `setToken()` does not clear either map. Isolated reproduction: fetch `/api/auth/me` as A, replace the token with B, immediately fetch the same endpoint; A's result is returned without a network request.

Impact: a shared browser can briefly display the previous account's profile/orders. The current cache lifetime is 15 seconds; this is client-side exposure, not a demonstrated server authorization bypass.

Recommendation: partition private caches by identity and business, clear them on login/logout/business changes, and prevent old in-flight requests from repopulating a new session's cache. Invalidate relevant lists after writes.

### 3. Pricing and numbering requests are blocked by admin middleware

Evidence: `native-admin/middleware.ts` exempts only login/signup paths from staff/executive authorization. `/api/store-settings` is deliberately public in its GET handler, and `/api/internal/next-document-number` checks its own internal service key, but neither request reaches its handler without an admin cookie. Both reproduced as HTTP 401.

The shared backend reads these endpoints without that cookie. It silently falls back to default fees and timestamp-based order numbers on failure.

There is a second pricing inconsistency: Native's `lib/an-sdk/storeSettings.ts` reads shared-backend `MobileAppConfig.storefront`, while admin Settings → Store writes its own `StoreSettings`, which the shared backend uses for order pricing.

Impact: changing fees in admin may not change checkout behavior as expected; displayed and charged totals can diverge as configurations change. Configured order numbering may silently be bypassed.

Recommendation: permit only GET for the public pricing route at middleware, delegate the exact internal numbering path to its service-key check, and use one canonical pricing settings source for display and charging. Show operational errors instead of silently treating fallback data as current settings.

### 4. Vendor onboarding and access do not match backend contracts

Evidence: `lib/an-sdk/vendors.ts` submits no `userId`, PAN or GST-registration flag. The shared backend `/api/vendors/apply` requires a registered username in `userId`, and PAN for non-GST vendors or GSTIN for GST vendors. Native's form cannot satisfy this contract. The SDK's `/api/vendors/me/status` route is absent from the inspected backend tree.

Native's `app/vendor/layout.js` permits only a small list of legacy role strings. The backend also grants vendor access through vendor ownership/team memberships; its login computes `hasVendorAccess`, but Native ignores the login result, loads `/api/auth/me` without that capability field, and routes everyone to `/`. `next` links back to the requested vendor screen are ignored.

Impact: applications fail validation, and legitimate vendor team members with a general STAFF/USER legacy role may be redirected to Sell on Native despite having vendor access.

Recommendation: align registration/application fields and status endpoints, expose verified vendor capability in the current-session response, and honor a validated local return path or vendor landing page. Keep shop credentials and vendor-user credentials explicit in the UI.

### 5. Disabling an account does not invalidate existing admin/executive cookies here

Evidence: Native Admin middleware verifies JWT signature/expiry and role flags. `getSession()` and `getExecutiveSession()` read injected headers; they do not revalidate account activity, executive profile activity, or session version. The executive cookie lasts 30 days. `angroupExecutiveFetch()` reads a local phone number but does not reject a disabled local user/profile before forwarding a service request. Some list filtering checks enabled verticals, but this is not a general revocation guard.

Impact: disabling a user after login does not reliably stop their existing session immediately. Exact downstream operations remain subject to backend order checks.

Recommendation: enforce active-user/profile and revocation-version checks at a shared server session boundary on protected operations. Keep per-order authorization in the backend.

## PWA review

| Surface | Current state | Required improvement |
| --- | --- | --- |
| Customer Native | Root manifest and global service worker registration exist; install prompt and iOS instructions exist | Add explicit 192px icon; implement the existing offline page as a navigation fallback; test installation on devices |
| Shop portal | Native `/shop/login` and `/shop/orders` exist locally; inherits customer manifest and app chrome | Add sign-out and shop identity; consider a shop-specific manifest/start URL and shop layout if shops should install a dedicated app |
| Vendor portal | Uses customer manifest and general account login | Resolve vendor access/onboarding contracts before treating it as a complete installable vendor application |
| Executive | Dedicated manifest, start URL and scope exist | Register service worker in the executive shell, not only `/executive/download`; make installation actionable only when a prompt/help is available |
| Staff Admin | No root admin manifest or general admin PWA installation flow found | Add one only if a separately installed staff admin app is wanted; executive configuration does not cover the staff shell |

Both manifests currently declare 128, 256, 512 and 1024px icons, but no 192px icon. MDN's Chromium installation guidance specifies both 192px and 512px entries: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable . Browser outcomes still need device validation; manual website installation may remain available even when promotion criteria are unmet.

Both service workers intercept every GET, including dynamic/API requests, and fall back to `caches.match(request)`. Only a few static assets are cached, so an offline page/API request can resolve to no Response. Both projects already have `public/offline.html`, but neither worker precaches or returns it. Limit static caching to explicit same-origin assets, leave live API operations network-only, and return the offline page for failed navigations. Cache deletion currently removes every other cache on the origin; restrict cleanup to the app's own cache prefix. Do not cache private orders, stock or live prices for offline reuse.

The executive download button remains enabled without a captured install prompt or iOS instructions, so it can do nothing on click. The service worker has no executive push handler. Customer web push subscription/display code exists, but delivery was not tested. Android customer push is explicitly disabled with `FIREBASE_CONFIGURED = false`, and device-token backend registration remains a TODO; do not present native Android pushes as completed.

## Other improvements

- Shop session currently lasts 30 days with no shop logout endpoint/UI. Add server-side cookie clearing and a visible shop name. Shop order-load errors also leave the empty-state message visible, which can misleadingly suggest there are no orders.
- Audit Native branding in customer-facing flows: checkout still sets the Razorpay merchant display name to `AN Group`; Sell on Native describes an AN Group account; invoice lookup returns AN Group invoice URLs. Use Native presentation/routes where appropriate while preserving accurate legal issuer details on invoices.
- Root Native layout injects organization JSON directly into a script. Escape `<` in serialized JSON before embedding business-controlled branding fields.
- Restrict middleware's broad dotted-path exclusion. Protected API identity should not depend solely on externally supplied headers if a route can bypass middleware. Review all dynamic API paths before changing the matcher.
- Add bounded timeouts and clear error handling to shared-backend proxies; current admin/executive/shop proxy fetches generally have no deadline.
- Maintain a staging acceptance suite using the real backend contracts. The current mock suite assumes obsolete signup behavior and cannot certify production integration.
- Clean up the Native Next 14 unsupported config option, and plan Native Admin's deprecated middleware-to-proxy migration after functional issues are resolved.

## Suggested work order

1. Invoice authorization and private cache isolation.
2. Canonical pricing, middleware exemptions and configured order numbering.
3. Session revocation and vendor application/access contracts.
4. PWA icons, shell registration, offline behavior and shop sign-out.
5. Staging tests: customer login/checkout/payment verification, shop handover, executive assignment/status, vendor onboarding, logout/account switching, install/update/offline and push behavior on Android/iOS.

This review added no production application changes. The earlier shop-login changes remain local and require deployment and authenticated acceptance testing.
