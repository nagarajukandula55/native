"use client";

import { useEffect, useState } from "react";

export default function StoreOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [awbModal, setAwbModal] = useState(null); // orderId of modal open
  const [awbInput, setAwbInput] = useState({ number: "", link: "" });

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
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

  async function updateStatus(orderId, status, awbDetails = null) {
    setUpdating(true);

    try {
      const res = await fetch("/api/store/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status, awbDetails }),
      });

      const json = await res.json();

      if (json.success) {
        loadOrders();
        closeAwbModal();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }

    setUpdating(false);
  }

  function openAwbModal(orderId) {
    setAwbModal(orderId);
    setAwbInput({ number: "", link: "" });
  }

  function closeAwbModal() {
    setAwbModal(null);
    setAwbInput({ number: "", link: "" });
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading Orders...</h2>;

  return (
    <div style={{ maxWidth: 1300, margin: "auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>🏪 Store Orders</h1>

      {orders.length === 0 && <p>No orders assigned</p>}

      {orders.map(order => (
        <div
          key={order._id}
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 15,
            marginTop: 15,
            background:
              order.status === "Packed"
                ? "#fef3c7"
                : order.status === "Shipped"
                ? "#e0f2fe"
                : order.status === "Delivered"
                ? "#d1fae5"
                : "#f9fafb",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div>
              <p>
                <strong>Order:</strong> {order.orderId}
              </p>
              <p>
                <strong>Customer:</strong> {order.customerName}
              </p>
            </div>

            <div>
              <span
                style={{
                  padding: "5px 10px",
                  borderRadius: 6,
                  background:
                    order.status === "Packed"
                      ? "#f59e0b33"
                      : order.status === "Shipped"
                      ? "#6366f133"
                      : order.status === "Delivered"
                      ? "#16a34a33"
                      : "#e0f2fe",
                  fontWeight: 600,
                }}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Items */}
          <div style={{ marginTop: 10 }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ fontSize: 14 }}>
                {item.name} × {item.quantity}
              </div>
            ))}
          </div>

          {/* Warehouse */}
          <div style={{ marginTop: 10 }}>
            <strong>Warehouse:</strong>{" "}
            {order.warehouseAssignments?.[0]?.warehouseId?.name || "N/A"}
          </div>

          {/* Actions */}
          <div style={{ marginTop: 15, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {order.status === "Order Placed" && (
              <button
                disabled={updating}
                onClick={() => updateStatus(order._id, "Packed")}
                style={btn("#f59e0b")}
              >
                📦 Mark Packed
              </button>
            )}

            {order.status === "Packed" && (
              <button
                disabled={updating}
                onClick={() => openAwbModal(order._id)}
                style={btn("#6366f1")}
              >
                🚚 Mark Shipped
              </button>
            )}

            {order.status === "Shipped" && (
              <button
                disabled={updating}
                onClick={() => updateStatus(order._id, "Delivered")}
                style={btn("#16a34a")}
              >
                ✅ Mark Delivered
              </button>
            )}
          </div>
        </div>
      ))}

      {/* AWB Modal */}
      {awbModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h2>Enter AWB / Tracking Info</h2>
            <input
              type="text"
              placeholder="AWB Number"
              value={awbInput.number}
              onChange={e => setAwbInput(prev => ({ ...prev, number: e.target.value }))}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Tracking Link (optional)"
              value={awbInput.link}
              onChange={e => setAwbInput(prev => ({ ...prev, link: e.target.value }))}
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 15, flexWrap: "wrap" }}>
              <button
                disabled={!awbInput.number || updating}
                onClick={() =>
                  updateStatus(awbModal, "Shipped", {
                    awbNumber: awbInput.number,
                    trackingLink: awbInput.link,
                  })
                }
                style={btn("#6366f1")}
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

/* Button Style */
function btn(color) {
  return {
    padding: "8px 12px",
    background: color,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  };
}

/* Input Style */
const inputStyle = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #ccc",
  minWidth: 200,
  marginTop: 10,
};

/* Modal Styles */
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
