"use client";

import { useEffect, useMemo, useState } from "react";
import OrderTimeline from "@/components/OrderTimeline";

export default function FulfillmentPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState("");
  const [couriers, setCouriers] = useState({});
  const [expanded, setExpanded] = useState(null);

  /* ================= FETCH ================= */

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/orders/list", {
        cache: "no-store",
      });

      const data = await res.json();

      if (data?.success) {
        setOrders(data.orders || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    let temp = [...orders];

    if (status !== "ALL") {
      temp = temp.filter((o) => o.status === status);
    }

    if (search) {
      const q = search.toLowerCase();

      temp = temp.filter(
        (o) =>
          o.orderId?.toLowerCase().includes(q) ||
          o.address?.phone?.includes(q) ||
          o.address?.name?.toLowerCase().includes(q) ||
          o.shipping?.awbNumber?.toLowerCase().includes(q)
      );
    }

    return temp;
  }, [orders, status, search]);

  /* ================= STATS ================= */

  const stats = useMemo(() => {
    const c = (s) => orders.filter((o) => o.status === s).length;

    return {
      total: orders.length,
      pending: c("PENDING_PAYMENT"),
      paid: c("PAID"),
      processing: c("PROCESSING"),
      packed: c("PACKED"),
      dispatched: c("DISPATCHED"),
      delivered: c("DELIVERED"),
    };
  }, [orders]);

  /* ================= STATUS ================= */

  const updateStatus = async (id, newStatus) => {
    await fetch("/api/admin/orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    fetchOrders();
  };

  /* ================= PAYMENT ================= */

  const markAsPaid = async (order) => {
    const utr = prompt("Enter UTR (optional)");

    await fetch("/api/payment/mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.orderId,
        utr,
      }),
    });

    fetchOrders();
  };

  /* ================= COURIERS ================= */

  const loadCouriers = async (order) => {
    const res = await fetch("/api/shipping/couriers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.orderId }),
    });

    const data = await res.json();

    setCouriers((p) => ({
      ...p,
      [order.orderId]: data.couriers || [],
    }));
  };

  /* ================= SHIPMENT ================= */

  const createShipment = async (order, courierId) => {
    setCreating(order.orderId);

    const dispatchType =
      document.getElementById(`dispatch-${order._id}`)?.value || "COURIER";

    await fetch("/api/shipping/create-shipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.orderId,
        courierId,
        dispatchType,
      }),
    });

    setCreating("");
    fetchOrders();
  };

  /* ================= UI ================= */

  return (
    <div style={styles.page}>
      
      {/* HEADER (Stripe style sticky feel) */}
      <div style={styles.header}>
        <div>
          <div style={styles.h1}>Enterprise Fulfillment</div>
          <div style={styles.sub}>Warehouse • Dispatch • Courier Control Tower</div>
        </div>

        <input
          style={styles.search}
          placeholder="Search order, phone, AWB..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* PIPELINE FILTER */}
      <div style={styles.pipeline}>
        {[
          "ALL",
          "PENDING_PAYMENT",
          "PAID",
          "PROCESSING",
          "PACKED",
          "DISPATCHED",
          "DELIVERED",
        ].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              ...styles.chip,
              background: status === s ? "#111827" : "#fff",
              color: status === s ? "#fff" : "#111827",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* GRID */}
      {loading ? (
        <div style={styles.loading}>Loading Operations...</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((o) => (
            <div key={o._id} style={styles.card}>
              
              {/* TOP BAR */}
              <div style={styles.top}>
                <div>
                  <div style={styles.orderId}>{o.orderId}</div>
                  <div style={styles.meta}>
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ ...styles.status, background: statusColor(o.status) }}>
                  {o.status}
                </div>
              </div>

              {/* CUSTOMER */}
              <div style={styles.box}>
                <div style={styles.boxTitle}>Customer</div>
                <div>{o.address?.name}</div>
                <div>{o.address?.phone}</div>
                <div>₹{o.amount}</div>
              </div>

              {/* SHIPPING */}
              <div style={styles.box}>
                <div style={styles.boxTitle}>Shipping</div>
                <div>{o.shipping?.courierPartner || "Not Assigned"}</div>
                <div>{o.shipping?.awbNumber || "-"}</div>
              </div>

              {/* TIMELINE */}
              <OrderTimeline order={o} />

              {/* ACTIONS (Stripe style grouped) */}
              <div style={styles.actions}>

                <button style={btn("#16a34a")} onClick={() => markAsPaid(o)}>
                  Mark Paid
                </button>

                <button style={btn("#2563eb")} onClick={() => updateStatus(o._id, "PROCESSING")}>
                  Process
                </button>

                <button style={btn("#7c3aed")} onClick={() => updateStatus(o._id, "PACKED")}>
                  Pack
                </button>

                <button
                  style={btn("#111827")}
                  onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                >
                  Courier
                </button>

                <a style={styles.link} href={`/api/invoice/${o.orderId}`} target="_blank">
                  Invoice
                </a>

                <a style={styles.link2} href={`/api/receipt/${o.orderId}`} target="_blank">
                  Receipt
                </a>

              </div>

              {/* COURIER EXPAND */}
              {expanded === o._id && (
                <div style={styles.expand}>
                  
                  <button onClick={() => loadCouriers(o)} style={btn("#0f172a")}>
                    Load Couriers
                  </button>

                  <select id={`dispatch-${o._id}`} style={styles.select}>
                    <option>COURIER</option>
                    <option>BY_HAND</option>
                    <option>LOCAL</option>
                  </select>

                  {couriers[o.orderId]?.map((c) => (
                    <button
                      key={c.courier_company_id}
                      style={btn("#ea580c")}
                      onClick={() => createShipment(o, c.courier_company_id)}
                    >
                      {c.courier_name}
                    </button>
                  ))}

                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= STYLE SYSTEM ================= */

const styles = {
  page: { padding: 24, background: "#f6f7fb", minHeight: "100vh" },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
    flexWrap: "wrap",
  },

  h1: { fontSize: 28, fontWeight: 900 },
  sub: { color: "#6b7280" },

  search: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #ddd",
    width: 300,
  },

  pipeline: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 20,
  },

  chip: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #ddd",
    fontWeight: 700,
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(380px,1fr))",
    gap: 14,
  },

  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 16,
  },

  top: {
    display: "flex",
    justifyContent: "space-between",
  },

  orderId: { fontWeight: 800 },

  meta: { fontSize: 12, opacity: 0.6 },

  status: {
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
  },

  box: {
    marginTop: 10,
    background: "#f9fafb",
    padding: 10,
    borderRadius: 10,
  },

  boxTitle: { fontWeight: 700, marginBottom: 4 },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  expand: {
    marginTop: 10,
    padding: 10,
    background: "#f3f4f6",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  select: {
    padding: 10,
    borderRadius: 10,
  },

  link: {
    background: "#111827",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
  },

  link2: {
    background: "#7c3aed",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
  },

  loading: { padding: 50, textAlign: "center", fontWeight: 800 },
};

const btn = (bg) => ({
  background: bg,
  color: "#fff",
  border: "none",
  padding: "10px 12px",
  borderRadius: 10,
  fontWeight: 700,
  cursor: "pointer",
});

const statusColor = (s) => ({
  PENDING_PAYMENT: "#ef4444",
  PAID: "#2563eb",
  PROCESSING: "#7c3aed",
  PACKED: "#f59e0b",
  DISPATCHED: "#0891b2",
  DELIVERED: "#16a34a",
}[s] || "#6b7280");
