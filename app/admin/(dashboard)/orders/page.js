"use client";

import { useEffect, useState } from "react";

export default function OrdersDashboard() {
  const [data, setData] = useState({});
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/order");
      const json = await res.json();

      if (json.success) {
        setData(json.grouped || {});
      } else {
        alert(json.message || "Failed to load orders");
      }
    } catch (err) {
      console.error(err);
      alert("Error loading orders");
    }

    setLoading(false);
  }

  /* ================= PAYMENT UPDATE ================= */
  async function updatePayment(orderId, status) {
    setUpdating(true);

    try {
      const res = await fetch("/api/admin/order/payment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });

      const json = await res.json();

      if (json.success) {
        alert("✅ Payment confirmed");
        load();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setUpdating(false);
  }

  /* ================= TABS ================= */
  const tabs = [
    { key: "pending", label: "🟡 Pending Assignment" },
    { key: "assigned", label: "🔵 Assigned" },
    { key: "packed", label: "🟠 Packed" },
    { key: "shipped", label: "🟣 Shipped" },
    { key: "delivered", label: "🟢 Delivered" },
    { key: "payments", label: "💰 Payment Pending" }, // 🔥 NEW TAB
  ];

  if (loading) return <h2 style={{ padding: 40 }}>Loading Orders...</h2>;

  /* ================= DATA SOURCE ================= */
  const list =
    activeTab === "payments"
      ? (data.all || []).filter(
          (o) => o.paymentMethod === "UPI" && o.paymentStatus === "Pending"
        )
      : data[activeTab] || [];

  return (
    <div style={{ padding: 20, maxWidth: 1300, margin: "auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        📦 Orders Dashboard
      </h1>

      {/* ================= TABS ================= */}
      <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        {tabs.map((t) => {
          const count =
            t.key === "payments"
              ? (data.all || []).filter(
                  (o) =>
                    o.paymentMethod === "UPI" &&
                    o.paymentStatus === "Pending"
                ).length
              : data[t.key]?.length || 0;

          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "10px 15px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: activeTab === t.key ? "#1e40af" : "#e5e7eb",
                color: activeTab === t.key ? "#fff" : "#000",
                fontWeight: 500,
              }}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ================= ORDERS ================= */}
      <div style={{ marginTop: 20 }}>
        {list.length === 0 && <p>No orders in this section</p>}

        {list.map((order) => (
          <div key={order._id} style={card}>

            {/* ===== BASIC INFO ===== */}
            <div style={{ marginBottom: 10 }}>
              <p><strong>Order ID:</strong> {order.orderId}</p>
              <p><strong>Customer:</strong> {order.customerName}</p>
              <p><strong>Status:</strong> {order.status}</p>

              <p>
                <strong>Payment:</strong>{" "}
                {order.paymentStatus === "Paid" ? (
                  <span style={{ color: "green" }}>💰 Paid</span>
                ) : (
                  <span style={{ color: "red" }}>⚠ Pending</span>
                )}
              </p>

              {order.assignedStore && (
                <p><strong>Store:</strong> {order.assignedStore.name}</p>
              )}

              {order.warehouseAssignments?.length > 0 && (
                <p>
                  <strong>Warehouse:</strong>{" "}
                  {order.warehouseAssignments[0]?.warehouseId?.name}
                </p>
              )}
            </div>

            {/* ===== ACTIONS ===== */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>

              {/* Assign */}
              {activeTab === "pending" && (
                <a href="/admin/orders/assign">
                  <button style={btnGreen}>Assign</button>
                </a>
              )}

              {/* Payment Confirm */}
              {order.paymentMethod === "UPI" &&
                order.paymentStatus === "Pending" && (
                  <button
                    onClick={() => updatePayment(order._id, "Paid")}
                    disabled={updating}
                    style={btnGreen}
                  >
                    ✅ Confirm Payment
                  </button>
                )}

              {/* View */}
              <a href={`/admin/orders/${order._id}`}>
                <button style={btnBlue}>View Details</button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const card = {
  border: "1px solid #eee",
  borderRadius: 10,
  padding: 15,
  marginBottom: 12,
  background: "#f9fafb",
};

const btnGreen = {
  padding: "8px 12px",
  background: "#16a34a",
  color: "#fff",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
};

const btnBlue = {
  padding: "8px 12px",
  background: "#0ea5e9",
  color: "#fff",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
};
