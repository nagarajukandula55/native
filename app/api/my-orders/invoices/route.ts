import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return NextResponse.json({ success: false }, { status: 401 });
  const base = (process.env.AN_GROUP_API_URL || process.env.NEXT_PUBLIC_AN_API || "")
    .replace(/^https?:\/\/angroup\.in(?=\/|$)/i, "https://www.angroup.in").replace(/\/$/, "");
  if (!base) return NextResponse.json({ success: false }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.orderIds) || body.orderIds.length > 100 ||
      body.orderIds.some((id: unknown) => typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id))) {
    return NextResponse.json({ success: false, message: "Provide up to 100 valid order IDs." }, { status: 400 });
  }
  try {
    const read = (path: string) => fetch(`${base}${path}`, {
      headers: { Authorization: authorization }, cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    const sessionRes = await read("/api/auth/me");
    const session = await sessionRes.json();
    if (!sessionRes.ok || !session.user?.id) return NextResponse.json({ success: false }, { status: 401 });
    const requested = new Set<string>(body.orderIds);
    const invoices: Record<string, { invoiceNumber: string; url: string }> = {};
    // Read with the customer's token, never a privileged service key.
    // An owner check also covers customers who additionally hold staff roles.
    for (let page = 1; requested.size && page <= 10; page++) {
      const response = await read(`/api/orders/list?page=${page}&limit=200&businessId=${encodeURIComponent(process.env.NEXT_PUBLIC_AN_BUSINESS_ID || "")}`);
      if (!response.ok) return NextResponse.json({ success: false }, { status: response.status });
      const data = await response.json();
      const orders = Array.isArray(data.orders) ? data.orders : [];
      for (const order of orders) {
        const id = String(order._id);
        const owner = String(order.userId?._id || order.userId || "");
        if (!requested.has(id) || owner !== String(session.user.id)) continue;
        requested.delete(id);
        if (order.invoice?.invoiceNumber && order.orderId) {
          invoices[id] = { invoiceNumber: order.invoice.invoiceNumber, url: `/invoice/${encodeURIComponent(order.orderId)}` };
        }
      }
      if (orders.length < 200) break;
    }
    return NextResponse.json({ success: true, invoices }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to load invoices." }, { status: 502 });
  }
}
