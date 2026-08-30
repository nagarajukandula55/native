import { NextResponse } from "next/server";

/**
 * Server-side proxy to ANgroup's GET /api/admin/native-products, the real
 * storefront-product admin list (isActive/isFeatured/isDeleted) — same
 * service-key pattern as app/api/admin/orders and app/api/admin/coupons.
 * The old admin/products/list page called /api/admin/products, which
 * doesn't exist on ANgroup at all (wrong model entirely) — this is the
 * actual endpoint.
 */
export async function GET(request: Request) {
  const apiBase = process.env.NEXT_PUBLIC_AN_API;
  const businessId = process.env.NEXT_PUBLIC_AN_BUSINESS_ID;
  const serviceKey = process.env.ADMIN_SERVICE_KEY;

  if (!apiBase || !businessId || !serviceKey) {
    return NextResponse.json(
      { success: false, message: "Admin native-products proxy is not configured" },
      { status: 500 }
    );
  }

  const incoming = new URL(request.url);
  const upstream = new URL(`${apiBase}/api/admin/native-products`);
  upstream.searchParams.set("businessId", businessId);
  const search = incoming.searchParams.get("search");
  if (search) upstream.searchParams.set("search", search);

  try {
    const res = await fetch(upstream.toString(), {
      headers: { "x-service-key": serviceKey },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Could not reach ANgroup" }, { status: 502 });
  }
}
