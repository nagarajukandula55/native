import { NextResponse } from "next/server";

/**
 * Server-side proxy to ANgroup's POST /api/invoice/generate. That route
 * used to require a real ANgroup staff session with finance:create
 * permission -- a customer landing on order-success after payment has
 * neither, so OrderSuccessClient.js's direct anPost() call 401'd on every
 * single order and invoices were never actually generated. ANgroup's route
 * now also accepts a service-key request (see its own route.ts comment),
 * scoped to Native's own orders only -- this route holds that key
 * server-side (ADMIN_SERVICE_KEY must never reach the browser) and is what
 * OrderSuccessClient.js calls instead.
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
