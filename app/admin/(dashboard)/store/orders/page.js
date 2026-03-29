"use client";

import { useEffect, useState } from "react";

export default function StoreOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [awbModal, setAwbModal] = useState(null);
  const [awbInput, setAwbInput] = useState({ number: "", courier: "", link: "" });

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
        await loadOrders();
        closeAwbModal();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
    setUpdatingId(null);
  }

  function openAwbModal(order) {
    setAwbModal(order._id);
    setAwbInput({
      number: order.awbNumber || "",
      courier: order.courierName || "",
      link: order.trackingLink || "",
    });
  }

  function closeAwbModal() {
    setAwbModal(null);
    setAwbInput({ number: "", courier: "", link: "" });
  }

  function renderActions(o) {
    const disabled = updatingId === o._id;

    if (o.status === "Order Placed") {
      return (
        <button
          onClick={() => handleUpdate(o._id, { status: "Packed" })}
          disabled={disabled}
          style={btn("#1e40af")}
        >
          {disabled ? "Updating..." : "📦 Mark Packed"}
        </button>
      );
    }

    if (o.status === "Packed") {
      return (
        <button
          onClick={() => openAwbModal(o)}
          disabled={disabled}
          style={btn("#7c3aed")}
        >
          {disabled ? "Updating..." : "🚚 Mark Shipped"}
        </button>
      );
    }

    if (o.status === "Shipped") {
      return (
        <button
          onClick={() => handleUpdate(o._id, { status: "Out For Delivery" })}
          disabled={disabled}
          style={btn("#f59e0b")}
        >
          {disabled ? "Updating..." : "🚛 Out For Delivery"}
        </button>
      );
    }

    if (o.status === "Out For Delivery") {
      return (
        <button
          onClick={() => handleUpdate(o._id, { status: "Delivered" })}
          disabled={disabled}
          style={btn("#16a34a")}
        >
          {disabled ? "Updating..." : "✅ Delivered"}
        </button>
      );
    }

    return null;
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading Orders...</h2>;

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>📦 Store Orders Dashboard</h1>

      {orders.length === 0 && <p>No orders assigned.</p>}

      {orders.map((o) => (
        <div key={o._id} style={card}>
          {/* HEADER */}
          <div style={header}>
            <div>
              <p><strong>Order ID:</strong> {o.orderId}</p>
              <p><strong>Customer:</strong> {o.customerName}</p>
            </div>
            <div style={badge(o.status)}>{o.status}</div>
          </div>

          {/* ITEMS */}
          <div style={box}>
            <strong>🧾 Items:</strong>
            {o.items.map((i, idx) => (
              <div key={idx}>
                {i.name} × {i.quantity}
              </div>
            ))}
          </div>

          {/* WAREHOUSE */}
          {o.warehouseAssignments?.length > 0 && (
            <div style={box}>
              <strong>🏬 Warehouse:</strong>{" "}
              {o.warehouseAssignments[0]?.warehouseId?.name || "N/A"}
            </div>
          )}

          {/* ACTIONS */}
          <div style={{ marginTop: 15 }}>{renderActions(o)}</div>

          {/* TIMELINE */}
          {o.statusHistory?.length > 0 && (
            <div style={{ marginTop: 15 }}>
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

      {/* AWB Modal */}
      {awbModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h2>Enter AWB & Courier Info</h2>
            <input
              placeholder="Courier Name"
              value={awbInput.courier}
              onChange={(e) =>
                setAwbInput((prev) => ({ ...prev, courier: e.target.value }))
              }
              style={inputStyle}
            />
            <input
              placeholder="AWB Number"
              value={awbInput.number}
              onChange={(e) =>
                setAwbInput((prev) => ({ ...prev, number: e.target.value }))
              }
              style={inputStyle}
            />
            <input
              placeholder="Tracking Link (optional)"
              value={awbInput.link}
              onChange={(e) =>
                setAwbInput((prev) => ({ ...prev, link: e.target.value }))
              }
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
              <button
                disabled={!awbInput.number || !awbInput.courier || updatingId === awbModal}
                onClick={() =>
                  handleUpdate(awbModal, {
                    status: "Shipped",
                    awbNumber: awbInput.number,
                    courierName: awbInput.courier,
                    trackingLink: awbInput.link,
                  })
                }
                style={btn("#7c3aed")}
              >
                🚚 Confirm Shipped
              </button>
              <button onClick={closeAwbModal} style={btn("#f87171")}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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

const header = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
};

const box = {
  background: "#fff",
  padding: 10,
  borderRadius: 6,
  marginTop: 10,
};

const btn = (color) => ({
  padding: "8px 12px",
  background: color,
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
});

const badge = (status) => ({
  padding: "6px 12px",
  borderRadius: 20,
  color: "#fff",
  background:
    status === "Delivered"
      ? "#16a34a"
      : status === "Shipped"
      ? "#9333ea"
      : status === "Packed"
      ? "#f59e0b"
      : "#6b7280",
});

const inputStyle = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #ccc",
  minWidth: 200,
  marginTop: 10,
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContent = {
  background: "#fff",
  padding: 30,
  borderRadius: 12,
  maxWidth: 400,
  width: "90%",
  boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "column",
};
