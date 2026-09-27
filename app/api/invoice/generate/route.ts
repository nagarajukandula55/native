import { NextResponse } from "next/server";

/**
 * Server-side proxy to ANgroup's POST /api/invoice/generate, holding
 * ADMIN_SERVICE_KEY server-side (must never reach the browser).
 *
 * Not currently called from anywhere in this app: ANgroup generates the
 * real SalesInvoice itself, automatically, on payment success
 * (src/app/api/payment/verify/route.ts and .../webhook/route.ts calling
 * createInvoiceForOrder) -- OrderSuccessClient.js only reads back
 * order.invoice once that's happened, it never triggers generation (see
 * that file's own comment). This proxy exists for a future manual
 * "regenerate/resend invoice" action; nothing 404s or breaks by its absence
 * of callers today.
 */
export async function POST(request: Request) {
  const apiBase = process.env.NEXT_PUBLIC_AN_API;
  const serviceKey = process.env.ADMIN_SERVICE_KEY;

  if (!apiBase || !serviceKey) {
    return NextResponse.json(
      { success: false, message: "Invoice generation proxy is not configured (missing NEXT_PUBLIC_AN_API / ADMIN_SERVICE_KEY)" },
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
    const res = await fetch(`${apiBase}/api/invoice/generate`, {
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
