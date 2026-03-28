"use client";

import { useEffect, useState } from "react";

export default function StoreOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/store/orders");
      const json = await res.json();

      if (json.success) {
        setOrders(json.orders || []);
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load orders");
    }
    setLoading(false);
  }

  /* ================= UPDATE ================= */
  async function handleUpdate(orderId, payload) {
    setUpdatingId(orderId);

    try {
      const res = await fetch("/api/store/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, ...payload }),
      });

      const json = await res.json();

      if (json.success) {
        loadOrders();
      } else {
        alert(json.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setUpdatingId(null);
  }

  /* ================= STATUS BUTTON ================= */
  function renderActions(o) {
    const disabled = updatingId === o._id;

    const btn = (label, nextStatus) => (
      <button
        onClick={() => {
          if (!o.warehouseAssignments?.length) {
            alert("⚠ Warehouse not assigned");
            return;
          }
          handleUpdate(o._id, { status: nextStatus });
        }}
        disabled={disabled}
        style={buttonPrimary}
      >
        {disabled ? "Updating..." : label}
      </button>
    );

    switch (o.status) {
      case "Order Placed":
        return btn("📦 Mark Packed", "Packed");
      case "Packed":
        return btn("🚚 Mark Shipped", "Shipped");
      case "Shipped":
        return btn("🚛 Out For Delivery", "Out For Delivery");
      case "Out For Delivery":
        return btn("✅ Delivered", "Delivered");
      default:
        return null;
    }
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading your orders...</h2>;

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        📦 Store Order Dashboard
      </h1>

      {orders.length === 0 && <p>No orders assigned to you yet.</p>}

      {orders.map((o) => (
        <div key={o._id} style={card}>
          
          {/* ================= HEADER ================= */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p><strong>Order ID:</strong> {o.orderId}</p>
              <p><strong>Status:</strong> {o.status}</p>
              <p><strong>Customer:</strong> {o.customerName}</p>
            </div>

            <div>
              <span style={statusBadge(o.status)}>
                {o.status}
              </span>
            </div>
          </div>

          {/* ================= PAYMENT ================= */}
          <p>
            <strong>Payment:</strong>{" "}
            {o.paymentStatus === "Paid" ? (
              <span style={{ color: "green" }}>💰 Paid</span>
            ) : (
              <span style={{ color: "red" }}>Pending</span>
            )}
          </p>

          {/* ================= WAREHOUSE ================= */}
          {o.warehouseAssignments?.length > 0 && (
            <div style={box}>
              <strong>🏬 Warehouse:</strong>{" "}
              {o.warehouseAssignments[0]?.warehouseId?.name || "N/A"}
            </div>
          )}

          {/* ================= ITEMS ================= */}
          <div style={box}>
            <strong>🧾 Items:</strong>
            {o.items.map((i, idx) => (
              <div key={idx}>
                {i.name} × {i.quantity}
              </div>
            ))}
          </div>

          {/* ================= ACTIONS ================= */}
          <div style={{ marginTop: 10 }}>
            {renderActions(o)}
          </div>

          {/* ================= COURIER ================= */}
          <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
            <input
              placeholder="AWB"
              defaultValue={o.awbNumber || ""}
              onBlur={(e) =>
                handleUpdate(o._id, { awbNumber: e.target.value })
              }
            />
            <input
              placeholder="Courier"
              defaultValue={o.courierName || ""}
              onBlur={(e) =>
                handleUpdate(o._id, { courierName: e.target.value })
              }
            />
          </div>

          {/* ================= HISTORY ================= */}
          {o.statusHistory?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <strong>Timeline:</strong>
              <ul>
                {o.statusHistory.map((s, i) => (
                  <li key={i}>
                    {new Date(s.time).toLocaleString()} → {s.status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ================= STYLES ================= */

const card = {
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 15,
  marginTop: 15,
  background: "#f9fafb",
};

const box = {
  background: "#fff",
  padding: 10,
  borderRadius: 6,
  marginTop: 10,
};

const buttonPrimary = {
  padding: "8px 12px",
  background: "#1e40af",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const statusBadge = (status) => ({
  padding: "5px 10px",
  borderRadius: 20,
  background:
    status === "Delivered"
      ? "#16a34a"
      : status === "Shipped"
      ? "#9333ea"
      : status === "Packed"
      ? "#f59e0b"
      : "#6b7280",
  color: "#fff",
});
