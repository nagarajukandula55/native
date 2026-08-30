import { NextResponse } from "next/server";

/**
 * Server-side proxy to ANgroup's GET /api/orders/list, using the
 * service-key path that route already supports (see
 * resolveAdminServiceRequest in ANgroup's lib/adminServiceAuth.ts).
 *
 * Admin/orders/page.js was calling getOrders() -> GET /api/orders/list
 * directly from the browser with only a bearer token. That route requires
 * a real ANgroup session cookie (getEnrichedSession()) for the
 * business-scoped path, which this frontend never establishes (its
 * "an_token" is a bearer token, not ANgroup's httpOnly session cookie) —
 * so admin orders always came back empty/401. ADMIN_SERVICE_KEY is
 * server-only (never NEXT_PUBLIC_) so the shared secret never reaches the
 * browser.
 */
export async function GET(request: Request) {
  const apiBase = process.env.NEXT_PUBLIC_AN_API;
  const businessId = process.env.NEXT_PUBLIC_AN_BUSINESS_ID;
  const serviceKey = process.env.ADMIN_SERVICE_KEY;

  if (!apiBase || !businessId || !serviceKey) {
    return NextResponse.json(
      { success: false, message: "Admin orders proxy is not configured (missing AN_API / AN_BUSINESS_ID / ADMIN_SERVICE_KEY)" },
      { status: 500 }
    );
  }

  const incoming = new URL(request.url);
  const upstream = new URL(`${apiBase}/api/orders/list`);
  upstream.searchParams.set("businessId", businessId);
  for (const key of ["status", "search", "from", "to", "page", "limit", "countOnly"]) {
    const value = incoming.searchParams.get(key);
    if (value) upstream.searchParams.set(key, value);
  }

  try {
    const res = await fetch(upstream.toString(), {
      headers: { "x-service-key": serviceKey },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Could not reach ANgroup" },
      { status: 502 }
    );
  }
}
