"use client";

import { useEffect, useState } from "react";
import OrderTimeline from "@/components/OrderTimeline";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/orders/list");
      const data = await res.json();

      if (data?.success) {
        setOrders(data.orders || []);
        setFiltered(data.orders || []);
      } else {
        setOrders([]);
        setFiltered([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  useEffect(() => {
    let temp = [...orders];

    if (status !== "ALL") {
      temp = temp.filter((o) => o.status === status);
    }

    if (search) {
      temp = temp.filter(
        (o) =>
          o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
          o.address?.phone?.includes(search)
      );
    }

    setFiltered(temp);
  }, [status, search, orders]);

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();

      if (data?.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === id ? { ...o, status: newStatus } : o
          )
        );
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  /* ================= MARK PAID ================= */
  const markAsPaid = async (order) => {
    try {
      const res = await fetch("/api/payment/mark-paid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.orderId,
        }),
      });

      const data = await res.json();

      if (data?.success) {
        fetchOrders();
      } else {
        alert("Failed to mark as paid");
      }
    } catch (err) {
      console.error(err);
      alert("Error marking paid");
    }
  };

  /* ================= BUTTONS ================= */
  const ActionButtons = ({ o }) => {
    const btn = (bg) => ({
      padding: "6px 10px",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600,
      background: bg,
      color: "#fff",
    });

    return (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>

        {/* MANUAL PAYMENT */}
        {o.payment?.status !== "SUCCESS" && (
          <button
            style={btn("#16a34a")}
            onClick={() => markAsPaid(o)}
          >
            Mark Paid
          </button>
        )}

        {/* FLOW */}
        {o.status === "PAID" && (
          <button style={btn("#2563eb")} onClick={() => updateStatus(o._id, "PROCESSING")}>
            Start Processing
          </button>
        )}

        {o.status === "PROCESSING" && (
          <button style={btn("#7c3aed")} onClick={() => updateStatus(o._id, "PACKED")}>
            Mark Packed
          </button>
        )}

        {o.status === "PACKED" && (
          <button style={btn("#f97316")} onClick={() => updateStatus(o._id, "DISPATCHED")}>
            Dispatch
          </button>
        )}

        {o.status === "DISPATCHED" && (
          <button style={btn("#111")} onClick={() => updateStatus(o._id, "DELIVERED")}>
            Delivered
          </button>
        )}

        {o.status === "DELIVERED" && (
          <span style={{
            padding: "4px 10px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            background: "#dcfce7",
          }}>
            Completed ✔
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={container}>

      {/* HEADER */}
      <div style={header}>
        <h2>📦 Orders Dashboard</h2>

        <input
          placeholder="Search Order ID / Phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* FILTER */}
      <div style={filters}>
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
              ...filterBtn,
              background: status === s ? "#c28b45" : "#eee",
              color: status === s ? "#fff" : "#000",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No orders</p>
      ) : (
        <div style={table}>
          <div style={rowHead}>
            <span>Order ID</span>
            <span>Customer</span>
            <span>Amount</span>
            <span>Payment</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filtered.map((o) => (
            <div key={o._id}>
              <div style={row}>
                <span>{o.orderId}</span>

                <span>
                  {o.address?.name || "N/A"}
                  <br />
                  <small>{o.address?.phone || "N/A"}</small>
                </span>

                <span>₹{o.amount}</span>

                <span>
                  <b>{o.payment?.status || "PENDING"}</b>
                </span>

                <span>
                  <b>{o.status}</b>
                </span>

                <ActionButtons o={o} />
              </div>

              {/* TIMELINE */}
              <div style={{ marginTop: 8, marginBottom: 12 }}>
                <OrderTimeline order={o} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const container = { padding: 20, maxWidth: 1200, margin: "auto" };

const header = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 20,
};

const input = {
  padding: 10,
  border: "1px solid #ddd",
  borderRadius: 8,
};

const filters = {
  display: "flex",
  gap: 10,
  marginBottom: 20,
  flexWrap: "wrap",
};

const filterBtn = {
  padding: "8px 12px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const table = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const rowHead = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
  fontWeight: "bold",
  padding: 10,
  background: "#f5f5f5",
  borderRadius: 8,
};

const row = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
  padding: 10,
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 8,
  alignItems: "center",
};
