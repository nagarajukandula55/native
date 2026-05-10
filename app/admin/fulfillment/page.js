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
  const [expandedCourier, setExpandedCourier] = useState(null);

  /* ================= FETCH ================= */

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/orders/list", {
        cache: "no-store",
      });

      const data = await res.json();

      if (data?.success) setOrders(data.orders || []);
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

  /* ================= ACTIONS ================= */

  const updateStatus = async (id, newStatus) => {
    await fetch("/api/admin/orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    fetchOrders();
  };

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

  const loadCouriers = async (order) => {
    const res = await fetch("/api/shipping/couriers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.orderId }),
    });

    const data = await res.json();

    setCouriers((prev) => ({
      ...prev,
      [order.orderId]: data.couriers || [],
    }));
  };

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

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Enterprise Fulfillment</div>
          <div style={styles.sub}>
            Warehouse • Payments • Shipping • Courier Orchestration
          </div>
        </div>

        <input
          style={styles.search}
          placeholder="Search order / phone / AWB / name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* STATUS FILTERS */}
      <div style={styles.filters}>
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
              ...styles.filterBtn,
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

              {/* ================= HEADER ================= */}
              <div style={styles.cardTop}>
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

              {/* ================= CUSTOMER CARD ================= */}
              <div style={styles.block}>
                <div style={styles.blockTitle}>Customer</div>
                <div>{o.address?.name}</div>
                <div>{o.address?.phone}</div>
                <div>{o.address?.city}</div>
              </div>

              {/* ================= PAYMENT CARD ================= */}
              <div style={styles.block}>
                <div style={styles.blockTitle}>Payment</div>
                <div>Method: {o.payment?.method}</div>
                <div>Status: {o.payment?.status}</div>
                <div>Amount: ₹{o.amount}</div>
              </div>

              {/* ================= SHIPPING CARD ================= */}
              <div style={styles.block}>
                <div style={styles.blockTitle}>Shipping</div>
                <div>Courier: {o.shipping?.courierPartner || "-"}</div>
                <div>AWB: {o.shipping?.awbNumber || "Not Assigned"}</div>
                <div>Status: {o.shipping?.trackingStatus || "-"}</div>
              </div>

              {/* ================= TIMELINE ================= */}
              <OrderTimeline order={o} />

              {/* ================= ACTIONS ================= */}
              <div style={styles.actions}>

                <button style={btn("#16a34a")} onClick={() => markAsPaid(o)}>
                  Mark Paid
                </button>

                <button style={btn("#2563eb")} onClick={() => updateStatus(o._id, "PROCESSING")}>
                  Processing
                </button>

                <button style={btn("#7c3aed")} onClick={() => updateStatus(o._id, "PACKED")}>
                  Packed
                </button>

                <button
                  style={btn("#111827")}
                  onClick={() =>
                    setExpandedCourier(expandedCourier === o._id ? null : o._id)
                  }
                >
                  Couriers
                </button>

                <a style={styles.link} href={`/api/invoice/${o.orderId}`} target="_blank">
                  Invoice
                </a>

                <a style={styles.link2} href={`/api/receipt/${o.orderId}`} target="_blank">
                  Receipt
                </a>

              </div>

              {/* ================= COURIER PANEL ================= */}
              {expandedCourier === o._id && (
                <div style={styles.expand}>
                  <button style={btn("#0f172a")} onClick={() => loadCouriers(o)}>
                    Load Couriers
                  </button>

                  <select id={`dispatch-${o._id}`} style={styles.select}>
                    <option value="COURIER">Courier</option>
                    <option value="BY_HAND">By Hand</option>
                    <option value="LOCAL_DELIVERY">Local Delivery</option>
                  </select>

                  {couriers[o.orderId]?.map((c) => (
                    <button
                      key={c.courier_company_id}
                      style={btn("#ea580c")}
                      onClick={() => createShipment(o, c.courier_company_id)}
                      disabled={creating === o.orderId}
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

/* ================= STYLES ================= */

const styles = {
  page: { padding: 24, background: "#f6f7fb", minHeight: "100vh" },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  },

  title: { fontSize: 28, fontWeight: 900 },
  sub: { color: "#6b7280" },

  search: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #ddd",
    width: 320,
  },

  filters: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },

  filterBtn: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #ddd",
    fontWeight: 700,
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(380px,1fr))",
    gap: 16,
  },

  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 16,
  },

  cardTop: { display: "flex", justifyContent: "space-between" },

  orderId: { fontWeight: 900 },

  meta: { fontSize: 12, color: "#6b7280" },

  status: {
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
  },

  block: {
    marginTop: 10,
    background: "#f9fafb",
    padding: 10,
    borderRadius: 10,
  },

  blockTitle: { fontWeight: 800, marginBottom: 4 },

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

  select: { padding: 10, borderRadius: 10 },

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

  loading: {
    textAlign: "center",
    padding: 50,
    fontWeight: 800,
  },
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
