import { NextResponse } from "next/server";

/**
 * Server-side proxy to ANgroup's POST /api/orders/invoice-lookup. Same
 * pattern as app/api/invoice/generate/route.ts -- a logged-in customer has
 * no ANgroup staff session, so this route holds ADMIN_SERVICE_KEY
 * server-side and forwards it, keeping the key out of the browser.
 * Batches a list of order ids so the "My Orders" page can show an
 * Invoice-vs-Receipt link per row without one request per order.
 */
export async function POST(request: Request) {
  const apiBase = process.env.NEXT_PUBLIC_AN_API;
  const serviceKey = process.env.ADMIN_SERVICE_KEY;

  if (!apiBase || !serviceKey) {
    return NextResponse.json(
      { success: false, message: "Invoice lookup proxy is not configured (missing NEXT_PUBLIC_AN_API / ADMIN_SERVICE_KEY)" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${apiBase}/api/orders/invoice-lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-service-key": serviceKey },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Could not reach ANgroup" }, { status: 502 });
  }
}
