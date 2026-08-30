import { NextResponse } from "next/server";

/**
 * Server-side proxy to ANgroup's GET/POST /api/coupons, using the same
 * service-key path as app/api/admin/orders/route.ts — the admin coupons
 * page was calling these routes straight from the browser with only a
 * bearer token, which those routes reject (they require either a real
 * ANgroup session or this service-key header, which must stay server-side).
 */
function upstreamBase() {
  const apiBase = process.env.NEXT_PUBLIC_AN_API;
  const businessId = process.env.NEXT_PUBLIC_AN_BUSINESS_ID;
  const serviceKey = process.env.ADMIN_SERVICE_KEY;
  if (!apiBase || !businessId || !serviceKey) return null;
  return { apiBase, businessId, serviceKey };
}

export async function GET(request: Request) {
  const cfg = upstreamBase();
  if (!cfg) {
    return NextResponse.json(
      { success: false, error: "Admin coupons proxy is not configured (missing AN_API / AN_BUSINESS_ID / ADMIN_SERVICE_KEY)" },
      { status: 500 }
    );
  }

  const incoming = new URL(request.url);
  const upstream = new URL(`${cfg.apiBase}/api/coupons`);
  upstream.searchParams.set("businessId", cfg.businessId);
  for (const key of ["status", "search"]) {
    const value = incoming.searchParams.get(key);
    if (value) upstream.searchParams.set(key, value);
  }

  try {
    const res = await fetch(upstream.toString(), {
      headers: { "x-service-key": cfg.serviceKey },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Could not reach ANgroup" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const cfg = upstreamBase();
  if (!cfg) {
    return NextResponse.json(
      { success: false, error: "Admin coupons proxy is not configured (missing AN_API / AN_BUSINESS_ID / ADMIN_SERVICE_KEY)" },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${cfg.apiBase}/api/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-service-key": cfg.serviceKey },
      body: JSON.stringify({ ...body, businessId: cfg.businessId }),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Could not reach ANgroup" }, { status: 502 });
  }
}
