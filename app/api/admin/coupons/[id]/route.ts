import { NextResponse } from "next/server";

function upstreamBase() {
  const apiBase = process.env.NEXT_PUBLIC_AN_API;
  const serviceKey = process.env.ADMIN_SERVICE_KEY;
  if (!apiBase || !serviceKey) return null;
  return { apiBase, serviceKey };
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const cfg = upstreamBase();
  if (!cfg) {
    return NextResponse.json({ success: false, error: "Admin coupons proxy is not configured" }, { status: 500 });
  }
  const { id } = await context.params;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${cfg.apiBase}/api/coupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-service-key": cfg.serviceKey },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Could not reach ANgroup" }, { status: 502 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const cfg = upstreamBase();
  if (!cfg) {
    return NextResponse.json({ success: false, error: "Admin coupons proxy is not configured" }, { status: 500 });
  }
  const { id } = await context.params;

  try {
    const res = await fetch(`${cfg.apiBase}/api/coupons/${id}`, {
      method: "DELETE",
      headers: { "x-service-key": cfg.serviceKey },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Could not reach ANgroup" }, { status: 502 });
  }
}
