import { NextResponse } from "next/server";

function upstreamBase() {
  const apiBase = process.env.NEXT_PUBLIC_AN_API;
  const businessId = process.env.NEXT_PUBLIC_AN_BUSINESS_ID;
  const serviceKey = process.env.ADMIN_SERVICE_KEY;
  if (!apiBase || !businessId || !serviceKey) return null;
  return { apiBase, businessId, serviceKey };
}

export async function GET() {
  const cfg = upstreamBase();
  if (!cfg) {
    return NextResponse.json(
      { success: false, message: "Admin email-templates proxy is not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${cfg.apiBase}/api/admin/email-templates?businessId=${cfg.businessId}`, {
      headers: { "x-service-key": cfg.serviceKey },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Could not reach ANgroup" }, { status: 502 });
  }
}
