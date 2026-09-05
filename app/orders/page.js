"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getMyOrders } from "@/lib/an-sdk/orders";
import { getMyGroceryOrders } from "@/lib/an-sdk/groceries";
import { getMyLiveMarketOrders } from "@/lib/an-sdk/liveMarket";
import { getMyFreshOrders } from "@/lib/an-sdk/fresh";
import { ApiError } from "@/lib/an-sdk/client";

const AN_API = (process.env.NEXT_PUBLIC_AN_API || "").replace(/^https?:\/\/angroup\.in/i, "https://www.angroup.in");

const STATUS_COLORS = {
  // Product orders
  DELIVERED: "#16a34a",
  COMPLETED: "#16a34a",
  DISPATCHED: "#2563eb",
  OUT_FOR_DELIVERY: "#7c3aed",
  PENDING_PAYMENT: "#f59e0b",
  PROCESSING: "#f59e0b",
  PACKED: "#f59e0b",
  READY_FOR_PICKUP: "#f59e0b",
  CANCELLED: "#e11d48",
  FAILED: "#e11d48",
  PAYMENT_FAILED: "#e11d48",
  REFUNDED: "#6b7280",
  RETURNED: "#6b7280",
  EXPIRED: "#6b7280",
  PAID: "#16a34a",
  // Grocery / Santha
  REQUESTED: "#f59e0b",
  QUOTE_UPLOADED: "#2563eb",
  QUOTE_REJECTED: "#e11d48",
  CONFIRMED_TO_SHOP: "#2563eb",
  PICKED_UP: "#7c3aed",
  // Live Market
  CONFIRMED: "#2563eb",
};

const TYPE_LABELS = {
  PRODUCT: "Product Order",
  MONTHLY_GROCERY: "Monthly Groceries",
  SANTHA: "Santha",
  LIVE_MARKET: "Live",
  FRESH: "Fresh",
};

/**
 * Whether this order has reached a "money collected" point, i.e. a receipt
 * exists / makes sense to show. Mirrors the PAID-receipt-email trigger
 * conditions in angroup's src/lib/order/update-order-status.ts and
 * src/app/api/grocery-orders/[id]/status/route.ts, plus LiveMarketOrder's
 * separate paymentStatus field (see src/models/LiveMarketOrder.ts).
 */
function isPaidOrLater(order) {
  if (order.type === "LIVE_MARKET" || order.type === "FRESH") {
    return order.paymentStatus === "PAID" || ["CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status);
  }
  if (order.type === "MONTHLY_GROCERY" || order.type === "SANTHA") {
    return ["PAID", "CONFIRMED_TO_SHOP", "PICKED_UP", "DELIVERED"].includes(order.status);
  }
  // PRODUCT
  return ![
    "CREATED",
    "PENDING_PAYMENT",
    "PENDING_REVIEW",
    "BILLING_REVISED",
    "PAYMENT_FAILED",
    "FAILED",
    "CANCELLED",
    "EXPIRED",
    "STOCK_FAILED",
  ].includes(order.status);
}

/** Public, unguessable-id receipt page for this order type -- see angroup's
 * src/app/receipt/[orderId], src/app/receipt/grocery/[id],
 * src/app/receipt/live-market/[id] (all confirmed public in the
 * public-route allowlist, src/middleware.ts). */
function receiptUrl(order) {
  if (order.type === "PRODUCT") return `${AN_API}/receipt/${order.orderId || order._id}`;
  if (order.type === "MONTHLY_GROCERY" || order.type === "SANTHA") return `${AN_API}/receipt/grocery/${order._id}`;
  if (order.type === "LIVE_MARKET") return `${AN_API}/receipt/live-market/${order._id}`;
  if (order.type === "FRESH") return `${AN_API}/receipt/fresh/${order._id}`;
  return null;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push("/login?next=/orders");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.allSettled([
      getMyOrders(),
      getMyGroceryOrders(user.id, "MONTHLY_GROCERY"),
      getMyGroceryOrders(user.id, "SANTHA"),
      getMyLiveMarketOrders(user.id),
      getMyFreshOrders(user.id),
    ])
      .then(async (results) => {
        if (cancelled) return;

        const [productRes, groceryRes, santhaRes, liveMarketRes, freshRes] = results;

        const productOrders =
          productRes.status === "fulfilled"
            ? (productRes.value?.orders || (Array.isArray(productRes.value) ? productRes.value : [])).map((o) => ({
                ...o,
                type: "PRODUCT",
              }))
            : [];
        const groceryOrders =
          groceryRes.status === "fulfilled" ? groceryRes.value.map((o) => ({ ...o, type: "MONTHLY_GROCERY" })) : [];
        const santhaOrders =
          santhaRes.status === "fulfilled" ? santhaRes.value.map((o) => ({ ...o, type: "SANTHA" })) : [];
        const liveMarketOrders =
          liveMarketRes.status === "fulfilled"
            ? liveMarketRes.value.map((o) => ({ ...o, type: "LIVE_MARKET" }))
            : [];
        const freshOrders =
          freshRes.status === "fulfilled" ? freshRes.value.map((o) => ({ ...o, type: "FRESH" })) : [];

        const merged = [...productOrders, ...groceryOrders, ...santhaOrders, ...liveMarketOrders, ...freshOrders].sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        if (results.every((r) => r.status === "rejected")) {
          const firstErr = results[0].status === "rejected" ? results[0].reason : null;
          setError(firstErr instanceof ApiError ? firstErr.message : "Could not load your orders");
        }

        setOrders(merged);
        setLoading(false);

        // Batch-fetch which of these already have a customer-facing B2C
        // invoice (SHIPPED/CONFIRMED+ orders) via native's own proxy to
        // angroup's service-key-gated /api/orders/invoice-lookup -- avoids
        // one request per row. Best-effort: a failed lookup just means
        // every row falls back to its receipt link.
        const idsNeedingInvoiceCheck = merged.filter(isPaidOrLater).map((o) => String(o._id)).filter(Boolean);
        if (idsNeedingInvoiceCheck.length) {
          try {
            const res = await fetch("/api/my-orders/invoices", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderIds: idsNeedingInvoiceCheck }),
              cache: "no-store",
            });
            const data = await res.json();
            if (!cancelled && data?.success) setInvoices(data.invoices || {});
          } catch (err) {
            console.error("Invoice lookup failed (non-fatal):", err);
          }
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load orders:", err);
        setError(err instanceof ApiError ? err.message : "Could not load your orders");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, userLoading, router]);

  if (userLoading || (loading && !error)) {
    return (
      <div className="container">
        <p>Loading your orders...</p>
        <style jsx>{`
          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>My Orders</h1>

      {error && <p className="error">{error}</p>}

      {!error && !orders.length && (
        <div className="empty">
          <p>You haven't placed any orders yet.</p>
          <Link href="/products" className="shopLink">
            Start shopping
          </Link>
        </div>
      )}

      <div className="list">
        {orders.map((order) => {
          const id = order._id || order.orderId;
          const status = order.status || "PENDING_PAYMENT";
          const color = STATUS_COLORS[status] || "#6b7280";
          const total = order.totalAmount ?? order.total ?? order.amount ?? order.quoteAmount ?? 0;
          const itemCount = order.items?.length || order.products?.length || 0;
          const paid = isPaidOrLater(order);
          const invoice = invoices[String(order._id)];
          const docUrl = invoice?.url || (paid ? receiptUrl(order) : null);
          const docLabel = invoice ? "Invoice" : "Receipt";

          const detailHref =
            order.type === "PRODUCT"
              ? `/order-success?orderId=${encodeURIComponent(order.orderId || id)}`
              : order.type === "LIVE_MARKET"
              ? `/live-market/orders/${id}`
              : order.type === "FRESH"
              ? `/fresh/orders/${id}`
              : `/${order.type === "SANTHA" ? "santha" : "groceries"}/orders/${id}`;

          return (
            <div key={`${order.type}-${id}`} className="row">
              <Link href={detailHref} className="rowMain">
                <p className="orderId">
                  <span className="typeTag">{TYPE_LABELS[order.type] || order.type}</span>
                  {" "}
                  Order #{String(order.orderId || id).slice(-8).toUpperCase()}
                </p>
                <p className="meta">
                  {itemCount ? `${itemCount} item${itemCount > 1 ? "s" : ""} · ` : ""}
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
                </p>
              </Link>

              <div className="rowRight">
                <span className="status" style={{ color, borderColor: color }}>
                  {status.replace(/_/g, " ")}
                </span>
                <span className="total">₹{Number(total).toLocaleString("en-IN")}</span>
                {docUrl ? (
                  <a href={docUrl} target="_blank" rel="noopener noreferrer" className="docLink">
                    {docLabel}
                  </a>
                ) : (
                  <span className="docLinkDisabled">{docLabel}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        h1 {
          margin-bottom: 24px;
        }
        .error {
          color: #e11d48;
        }
        .empty {
          background: #fff;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        .shopLink {
          display: inline-block;
          margin-top: 12px;
          padding: 10px 24px;
          background: #c28b45;
          color: #fff;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 600;
        }
        .list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          gap: 12px;
          flex-wrap: wrap;
        }
        .rowMain {
          text-decoration: none;
          color: inherit;
          flex: 1;
          min-width: 200px;
        }
        .typeTag {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #c28b45;
          background: #fdf3e7;
          border-radius: 6px;
          padding: 2px 6px;
          margin-right: 6px;
        }
        .orderId {
          font-weight: 600;
          margin: 0 0 4px;
        }
        .meta {
          margin: 0;
          font-size: 12px;
          color: #888;
        }
        .rowRight {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .status {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid;
          white-space: nowrap;
        }
        .total {
          font-weight: 700;
          white-space: nowrap;
        }
        .docLink {
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          background: #c28b45;
          padding: 6px 14px;
          border-radius: 20px;
          text-decoration: none;
          white-space: nowrap;
        }
        .docLink:hover {
          background: #a97638;
        }
        .docLinkDisabled {
          font-size: 12px;
          font-weight: 700;
          color: #bbb;
          background: #f3f3f3;
          padding: 6px 14px;
          border-radius: 20px;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
