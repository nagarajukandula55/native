import { NextResponse } from "next/server";

function upstreamBase() {
  const apiBase = process.env.NEXT_PUBLIC_AN_API;
  const businessId = process.env.NEXT_PUBLIC_AN_BUSINESS_ID;
  const serviceKey = process.env.ADMIN_SERVICE_KEY;
  if (!apiBase || !businessId || !serviceKey) return null;
  return { apiBase, businessId, serviceKey };
}

export async function PUT(request: Request, context: { params: Promise<{ key: string }> }) {
  const cfg = upstreamBase();
  if (!cfg) {
    return NextResponse.json({ success: false, message: "Admin email-templates proxy is not configured" }, { status: 500 });
  }
  const { key } = await context.params;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${cfg.apiBase}/api/admin/email-templates/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-service-key": cfg.serviceKey },
      body: JSON.stringify({ ...body, businessId: cfg.businessId }),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Could not reach ANgroup" }, { status: 502 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ key: string }> }) {
  const cfg = upstreamBase();
  if (!cfg) {
    return NextResponse.json({ success: false, message: "Admin email-templates proxy is not configured" }, { status: 500 });
  }
  const { key } = await context.params;

  try {
    const res = await fetch(`${cfg.apiBase}/api/admin/email-templates/${key}?businessId=${cfg.businessId}`, {
      method: "DELETE",
      headers: { "x-service-key": cfg.serviceKey },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Could not reach ANgroup" }, { status: 502 });
  }
}
