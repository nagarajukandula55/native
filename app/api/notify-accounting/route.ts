import { NextResponse } from "next/server";

/**
 * Server-side proxy to AN-Accounting's sales ingestion API. Exists so the
 * real ACCOUNTING_API_KEY never reaches the browser — OrderSuccessClient.js
 * calls this internal route instead of AN-Accounting directly.
 *
 * Never fails the caller: on any error (not configured, unreachable, bad
 * response), returns { ok: false } rather than throwing — a broken push to
 * the owner's bookkeeping app must never break the order-success page for
 * a customer.
 */
export async function POST(request: Request) {
  const url = process.env.ACCOUNTING_API_URL;
  const key = process.env.ACCOUNTING_API_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, reason: "not_configured" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_body" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("[notify-accounting] AN-Accounting rejected the sale:", response.status, data);
      return NextResponse.json({ ok: false, reason: "upstream_error", status: response.status });
    }

    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    console.error("[notify-accounting] Could not reach AN-Accounting:", error);
    return NextResponse.json({ ok: false, reason: "unreachable" });
  }
}
