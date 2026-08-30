import { NextResponse } from "next/server";

/**
 * Server-side proxy to ANgroup's GET /api/logistics/overview -- the
 * missing "logistics maintenance" surface, backing the new Logistics tab
 * on the admin Orders page. Same service-key pattern as the other
 * app/api/admin/* proxies.
 */
export async function GET() {
  const apiBase = process.env.NEXT_PUBLIC_AN_API;
  const businessId = process.env.NEXT_PUBLIC_AN_BUSINESS_ID;
  const serviceKey = process.env.ADMIN_SERVICE_KEY;

  if (!apiBase || !businessId || !serviceKey) {
    return NextResponse.json(
      { success: false, error: "Admin logistics proxy is not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${apiBase}/api/logistics/overview?businessId=${businessId}`, {
      headers: { "x-service-key": serviceKey },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Could not reach ANgroup" }, { status: 502 });
  }
}
