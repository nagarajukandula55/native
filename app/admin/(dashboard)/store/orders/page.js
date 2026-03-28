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

      const res = await fetch("/api/store/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (json.success) {
        await loadOrders();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setUpdatingId(null);
  }

  /* ================= ACTION BUTTONS ================= */
  function renderActions(o) {
    const disabled = updatingId === o._id;

    // 📦 PACK
    if (o.status === "Order Placed") {
      return (
        <button
          onClick={() => handleUpdate(o._id, { status: "Packed" })}
          disabled={disabled}
          style={btnPrimary}
        >
          {disabled ? "Updating..." : "📦 Mark Packed"}
        </button>
      );
    }

    // 🚚 SHIP (WITH VALIDATION)
    if (o.status === "Packed") {
      return (
        <button
          onClick={() => {
            if (!o.awbNumber || !o.courierName) {
              alert("❌ Enter AWB & Courier before shipping");
              return;
            }

            handleUpdate(o._id, { status: "Shipped" });
          }}
          disabled={disabled}
          style={btnPurple}
        >
          {disabled ? "Updating..." : "🚚 Mark Shipped"}
        </button>
      );
    }

    // 🚛 OUT FOR DELIVERY
    if (o.status === "Shipped") {
      return (
        <button
          onClick={() =>
            handleUpdate(o._id, { status: "Out For Delivery" })
          }
          disabled={disabled}
          style={btnOrange}
        >
          🚛 Out For Delivery
        </button>
      );
    }

    // ✅ DELIVERED
    if (o.status === "Out For Delivery") {
      return (
        <button
          onClick={() =>
            handleUpdate(o._id, { status: "Delivered" })
          }
          disabled={disabled}
          style={btnGreen}
        >
          ✅ Delivered
        </button>
      );
    }

    return null;
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading...</h2>;

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        📦 Store Orders Dashboard
      </h1>

      {orders.length === 0 && <p>No orders assigned.</p>}

      {orders.map((o) => (
        <div key={o._id} style={card}>
          
          {/* HEADER */}
          <div style={header}>
            <div>
              <p><strong>Order ID:</strong> {o.orderId}</p>
              <p><strong>Status:</strong> {o.status}</p>
              <p><strong>Customer:</strong> {o.customerName}</p>
            </div>

            <div style={badge(o.status)}>
              {o.status}
            </div>
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

          {/* COURIER INPUTS */}
          <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
            <input
              placeholder="AWB Number"
              defaultValue={o.awbNumber || ""}
              onBlur={(e) =>
                handleUpdate(o._id, { awbNumber: e.target.value })
              }
            />

            <input
              placeholder="Courier Name"
              defaultValue={o.courierName || ""}
              onBlur={(e) =>
                handleUpdate(o._id, { courierName: e.target.value })
              }
            />
          </div>

          {/* ACTIONS */}
          <div style={{ marginTop: 15 }}>
            {renderActions(o)}
          </div>

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
};

const box = {
  background: "#fff",
  padding: 10,
  borderRadius: 6,
  marginTop: 10,
};

const btnPrimary = {
  padding: "8px 12px",
  background: "#1e40af",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};

const btnPurple = {
  padding: "8px 12px",
  background: "#7c3aed",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};

const btnOrange = {
  padding: "8px 12px",
  background: "#f59e0b",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};

const btnGreen = {
  padding: "8px 12px",
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};

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
