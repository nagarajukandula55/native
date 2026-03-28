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

  async function handleUpdate(orderId, payload) {
    if (!orderId) {
      alert("❌ Order ID missing");
      return;
    }

    setUpdatingId(orderId);

    try {
      const body = { id: orderId, ...payload };

      console.log("🚀 Sending:", body);

      const res = await fetch("/api/store/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (json.success) {
        loadOrders();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setUpdatingId(null);
  }

  function renderActions(o) {
    const disabled = updatingId === o._id;

    const btn = (label, nextStatus) => (
      <button
        onClick={() => handleUpdate(o._id, { status: nextStatus })}
        disabled={disabled}
        style={button}
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

  if (loading) return <h2 style={{ padding: 40 }}>Loading...</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 Store Orders</h1>

      {orders.map((o) => (
        <div key={o._id} style={card}>
          <p><strong>Order ID:</strong> {o.orderId}</p>
          <p><strong>Status:</strong> {o.status}</p>

          {renderActions(o)}

          <div style={{ marginTop: 10 }}>
            <input
              placeholder="AWB"
              defaultValue={o.awbNumber || ""}
              onBlur={(e) =>
                handleUpdate(o._id, { awbNumber: e.target.value })
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const card = {
  border: "1px solid #ccc",
  padding: 10,
  marginTop: 10,
};

const button = {
  padding: "6px 10px",
  background: "#1e40af",
  color: "#fff",
  border: "none",
  borderRadius: 5,
};
