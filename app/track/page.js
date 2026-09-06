"use client";

import { useState } from "react";
import { getOrderById } from "@/lib/an-sdk/orders";
import { syncTracking } from "@/lib/an-sdk/shipping";

/* =========================================================
   STAGE MODEL
   Maps the real `order.status` enum values (see angroup's
   models/Order.ts) onto a small set of customer-facing shipment
   stages. Only statuses that represent forward progress toward
   delivery are placed on the line — terminal/exception statuses
   (CANCELLED, RETURNED, REFUNDED, FAILED, PAYMENT_FAILED, EXPIRED,
   STOCK_FAILED) are shown as a separate callout instead of forcing
   them onto a progress bar that assumes forward motion.
========================================================= */

const STAGES = [
  { key: "PLACED", label: "Order Placed", statuses: ["CREATED", "PENDING_PAYMENT", "PENDING_REVIEW", "BILLING_REVISED"] },
  { key: "CONFIRMED", label: "Confirmed", statuses: ["PAID"] },
  { key: "PROCESSING", label: "Processing", statuses: ["PROCESSING", "PACKED", "READY_FOR_PICKUP"] },
  { key: "DISPATCHED", label: "Dispatched", statuses: ["DISPATCHED"] },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", statuses: ["OUT_FOR_DELIVERY"] },
  { key: "DELIVERED", label: "Delivered", statuses: ["DELIVERED", "COMPLETED"] },
];

const TERMINAL_EXCEPTIONS = {
  CANCELLED: "This order was cancelled.",
  RETURNED: "This order was returned.",
  REFUNDED: "This order was refunded.",
  FAILED: "This order could not be completed.",
  PAYMENT_FAILED: "Payment failed for this order.",
  EXPIRED: "This order expired before payment was completed.",
  STOCK_FAILED: "This order could not be fulfilled due to a stock issue.",
};

function stageIndexForStatus(status) {
  const idx = STAGES.findIndex((s) => s.statuses.includes(status));
  return idx === -1 ? 0 : idx;
}

// Human-friendly label for the raw event `type` values written across the
// backend (update-order-status.ts, sync-tracking.ts, create-shipment.ts,
// webhooks/an-logistics/route.ts, mark-paid, etc). Falls back to a
// title-cased version of the raw type for anything not in this map, so a
// future event type never disappears silently.
const EVENT_LABELS = {
  STATUS_UPDATED: "Status updated",
  STATUS_CHANGED: "Shipping status updated",
  SHIPPING_STATUS_UPDATE: "Shipping status updated",
  PAYMENT_VERIFIED: "Payment verified",
  PAYMENT_SUCCESS: "Payment received",
  PAYMENT_FAILED: "Payment failed",
  SHIPPED: "Shipment created",
  PICKUP_REQUESTED: "Pickup requested",
  INVOICE_GENERATED: "Invoice generated",
  ORDER_EXPIRED: "Order expired",
  NOTE_ADDED: "Note added",
};

function labelForEvent(type) {
  if (EVENT_LABELS[type]) return EVENT_LABELS[type];
  if (!type) return "Update";
  return type
    .toLowerCase()
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDateTime(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function TrackOrderPage() {
  const [input, setInput] = useState("");
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [refreshError, setRefreshError] = useState("");

  /* ================= FETCH (initial lookup) ================= */

  const fetchTracking = async () => {
    try {
      setLoading(true);
      setError("");
      setRefreshError("");
      setOrder(null);
      setTracking(null);

      if (!input.trim()) {
        setError("Please enter Order ID or AWB Number");
        return;
      }

      // Look up by orderId directly instead of pulling the entire (currently
      // unauthenticated, unfiltered) /api/orders/list — see lib/an-sdk/orders.ts
      // for why that route shouldn't be used for a customer-facing lookup.
      const res = await getOrderById(input.trim());
      const foundOrder = res?.order || (res?.success ? res : null);

      if (!foundOrder) {
        setError("Order not found");
        return;
      }

      setOrder(foundOrder);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while tracking order");
    } finally {
      setLoading(false);
    }
  };

  /* ================= REFRESH (manual live pull) =================
     order.shipping.trackingStatus is kept fresh automatically by the
     an-logistics status webhook (and by this same live pull, once run) —
     that's the "last known status" shown by default. This button is an
     on-demand call straight to the live carrier API for a manual refresh,
     not something that runs automatically on every page view. */

  const refreshLiveStatus = async () => {
    if (!order?.shipping?.awbNumber) return;
    try {
      setRefreshing(true);
      setRefreshError("");
      const trackRes = await syncTracking(order.shipping.awbNumber);
      if (trackRes?.success) {
        setTracking(trackRes);
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                shipping: {
                  ...prev.shipping,
                  trackingStatus: trackRes.trackingStatus || prev.shipping?.trackingStatus,
                },
              }
            : prev
        );
      } else {
        setRefreshError("Live status isn't available right now — showing last known status.");
      }
    } catch (err) {
      console.error(err);
      setRefreshError("Couldn't reach the live carrier feed — showing last known status.");
    } finally {
      setRefreshing(false);
    }
  };

  const status = order?.status;
  const isException = status && TERMINAL_EXCEPTIONS[status];
  const activeStageIdx = status ? stageIndexForStatus(status) : -1;
  const events = Array.isArray(order?.events) ? order.events : [];
  const lastEvent = events[events.length - 1];
  const lastUpdated =
    tracking?.tracking?.tracking_data?.shipment_track?.[0]?.updated_at ||
    lastEvent?.createdAt ||
    order?.shipping?.deliveredAt ||
    order?.shipping?.shippedAt;

  /* ================= UI ================= */

  return (
    <div style={container}>
      {/* HERO */}
      <div style={hero}>
        <h1 style={title}>📦 Track Your Order</h1>
        <p style={sub}>Enter Order ID or AWB Number to track shipment</p>

        <div style={searchBox}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchTracking()}
            placeholder="Enter Order ID / AWB"
            style={inputStyle}
          />

          <button onClick={fetchTracking} style={btn} disabled={loading}>
            {loading ? "Tracking…" : "Track"}
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && <div style={errorBox}>{error}</div>}

      {/* LOADING */}
      {loading && <div style={loadingBox}>Tracking your order...</div>}

      {order && (
        <div style={card}>
          {/* ORDER HEADER */}
          <div style={orderHeaderRow}>
            <div>
              <h2 style={{ margin: 0, color: "#1f3d2b" }}>Order #{order.orderId}</h2>
              <p style={{ margin: "4px 0 0", color: "#666", fontSize: 14 }}>
                {order?.address?.name}
                {order?.address?.phone ? ` • ${order.address.phone}` : ""}
              </p>
            </div>
            <span style={statusPill(isException)}>
              {isException ? status.replace(/_/g, " ") : (status || "").replace(/_/g, " ")}
            </span>
          </div>

          {isException ? (
            <div style={exceptionBox}>{TERMINAL_EXCEPTIONS[status]}</div>
          ) : (
            <>
              {/* TIMELINE */}
              <div style={timelineWrap}>
                {STAGES.map((stage, idx) => {
                  const done = idx < activeStageIdx;
                  const active = idx === activeStageIdx;
                  const future = idx > activeStageIdx;
                  return (
                    <div key={stage.key} style={timelineStep}>
                      <div style={timelineNodeCol}>
                        <div style={timelineDot(done, active, future)}>
                          {done ? "✓" : active ? <span style={pulseDot} /> : ""}
                        </div>
                        {idx < STAGES.length - 1 && <div style={timelineLine(done)} />}
                      </div>
                      <div style={timelineLabelCol}>
                        <p style={timelineLabel(done || active)}>{stage.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* LAST KNOWN STATUS / REFRESH */}
          <div style={statusRow}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 0.4 }}>
                Last known status
              </p>
              <p style={{ margin: "2px 0 0", fontWeight: 600, color: "#1a1a1a" }}>
                {order?.shipping?.trackingStatus || "Pending"}
              </p>
              {lastUpdated && (
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}>
                  Updated {formatDateTime(lastUpdated)}
                </p>
              )}
            </div>
            {order?.shipping?.awbNumber && (
              <button onClick={refreshLiveStatus} style={refreshBtn} disabled={refreshing}>
                {refreshing ? "Refreshing…" : "Refresh live status"}
              </button>
            )}
          </div>
          {refreshError && <p style={{ margin: "8px 0 0", fontSize: 13, color: "#b45309" }}>{refreshError}</p>}
          {tracking?.success && !refreshError && (
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#1f3d2b" }}>
              Live status pulled just now from the carrier.
            </p>
          )}

          {/* ORDER DETAILS */}
          <div style={grid}>
            <div style={gridCell}>
              <b style={gridLabel}>Amount</b>
              <p style={gridValue}>₹{order?.amount}</p>
            </div>
            <div style={gridCell}>
              <b style={gridLabel}>Courier</b>
              <p style={gridValue}>{order?.shipping?.courierPartner || "-"}</p>
            </div>
            <div style={gridCell}>
              <b style={gridLabel}>AWB</b>
              <p style={gridValue}>{order?.shipping?.awbNumber || "-"}</p>
            </div>
          </div>

          {order?.shipping?.trackingUrl && (
            <p style={{ margin: "12px 0 0", fontSize: 13, color: "#444" }}>
              Full carrier tracking is available at{" "}
              <a href={order.shipping.trackingUrl} target="_blank" rel="noreferrer" style={linkStyle}>
                the courier&apos;s tracking page
              </a>
              .
            </p>
          )}

          {/* DELIVERY ADDRESS */}
          {order?.address?.address && (
            <div style={addressBox}>
              <b style={gridLabel}>Delivery address</b>
              <p style={{ margin: "4px 0 0", color: "#333", fontSize: 14, lineHeight: 1.5 }}>
                {order.address.address}
                {order.address.city ? `, ${order.address.city}` : ""}
                {order.address.state ? `, ${order.address.state}` : ""}
                {order.address.pincode ? ` - ${order.address.pincode}` : ""}
              </p>
            </div>
          )}

          {/* ITEMS */}
          {Array.isArray(order?.items) && order.items.length > 0 && (
            <div style={addressBox}>
              <b style={gridLabel}>Items</b>
              <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none" }}>
                {order.items.map((it, i) => (
                  <li key={i} style={itemRow}>
                    <span>
                      {it.name} {it.variant ? `(${it.variant})` : ""}
                    </span>
                    <span style={{ color: "#888" }}>
                      x{it.qty} · ₹{it.total}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* EVENT HISTORY */}
          {events.length > 0 && (
            <div style={addressBox}>
              <b style={gridLabel}>Update history</b>
              <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none" }}>
                {events
                  .slice()
                  .reverse()
                  .map((ev, i) => (
                    <li key={i} style={eventRow}>
                      <span style={{ color: "#1a1a1a" }}>{ev.message || labelForEvent(ev.type)}</span>
                      <span style={{ color: "#aaa", fontSize: 12 }}>{formatDateTime(ev.createdAt)}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= LIGHT UI — matches the site's established palette
   (cream background, #1f3d2b dark-green primary, #c28b45 gold accent,
   white rounded cards) already used across HomeClient.js / Footer.js /
   checkout / sell pages. ================= */

const container = {
  minHeight: "calc(100vh - 200px)",
  background: "#faf8f3",
  color: "#1a1a1a",
  padding: "40px 20px 60px",
};

const hero = {
  maxWidth: 760,
  margin: "0 auto",
  padding: 36,
  borderRadius: 16,
  background: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  textAlign: "center",
};

const title = {
  fontSize: 28,
  fontWeight: 700,
  margin: 0,
  color: "#1f3d2b",
};

const sub = {
  color: "#666",
  marginTop: 8,
  marginBottom: 0,
  fontSize: 14,
};

const searchBox = {
  display: "flex",
  alignItems: "stretch",
  gap: 12,
  marginTop: 22,
};

const inputStyle = {
  flex: 1,
  padding: "13px 14px",
  borderRadius: 8,
  border: "1px solid #ddd",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};

const btn = {
  padding: "13px 26px",
  background: "#1f3d2b",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const card = {
  maxWidth: 760,
  margin: "20px auto 0",
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
};

const orderHeaderRow = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const statusPill = (isException) => ({
  padding: "6px 14px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.3,
  textTransform: "uppercase",
  background: isException ? "#fdecec" : "#eaf3ec",
  color: isException ? "#c0392b" : "#1f3d2b",
  whiteSpace: "nowrap",
});

const exceptionBox = {
  marginTop: 18,
  padding: "14px 16px",
  borderRadius: 10,
  background: "#fdecec",
  color: "#c0392b",
  fontSize: 14,
};

/* -------- timeline -------- */

const timelineWrap = {
  display: "flex",
  marginTop: 26,
  overflowX: "auto",
  paddingBottom: 4,
};

const timelineStep = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: "1 0 100px",
  minWidth: 100,
};

const timelineNodeCol = {
  display: "flex",
  alignItems: "center",
  width: "100%",
};

const timelineDot = (done, active, future) => ({
  width: 28,
  height: 28,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  fontSize: 13,
  fontWeight: 700,
  color: done || active ? "#fff" : "#bbb",
  background: done ? "#1f3d2b" : active ? "#c28b45" : "#eee",
  border: future ? "2px solid #e2e2e2" : "none",
  marginLeft: "-14px",
});

const pulseDot = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#fff",
};

const timelineLine = (done) => ({
  flex: 1,
  height: 3,
  background: done ? "#1f3d2b" : "#eee",
  marginLeft: "-2px",
});

const timelineLabelCol = {
  marginTop: 8,
  textAlign: "center",
};

const timelineLabel = (highlighted) => ({
  margin: 0,
  fontSize: 12,
  fontWeight: highlighted ? 700 : 500,
  color: highlighted ? "#1f3d2b" : "#aaa",
});

/* -------- status / refresh -------- */

const statusRow = {
  marginTop: 22,
  paddingTop: 18,
  borderTop: "1px solid #f0f0f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const refreshBtn = {
  padding: "9px 18px",
  background: "#fff",
  border: "1.5px solid #c28b45",
  borderRadius: 8,
  color: "#c28b45",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 12,
  marginTop: 18,
};

const gridCell = {
  background: "#faf8f3",
  borderRadius: 10,
  padding: "12px 14px",
  textAlign: "center",
};

const gridLabel = {
  fontSize: 12,
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};

const gridValue = {
  margin: "4px 0 0",
  fontWeight: 600,
  color: "#1a1a1a",
};

const addressBox = {
  marginTop: 18,
  paddingTop: 18,
  borderTop: "1px solid #f0f0f0",
};

const itemRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  fontSize: 14,
  padding: "6px 0",
  borderBottom: "1px dashed #f0f0f0",
};

const eventRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  fontSize: 13,
  padding: "6px 0",
  borderBottom: "1px dashed #f0f0f0",
};

const linkStyle = {
  color: "#c28b45",
  fontWeight: 600,
  textDecoration: "underline",
};

const errorBox = {
  maxWidth: 760,
  margin: "20px auto 0",
  background: "#fdecec",
  color: "#e11d48",
  padding: "12px 16px",
  borderRadius: 10,
  textAlign: "center",
  fontSize: 14,
};

const loadingBox = {
  textAlign: "center",
  marginTop: 20,
  color: "#666",
};
