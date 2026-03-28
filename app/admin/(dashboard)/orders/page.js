"use client";

import { useEffect, useState } from "react";

export default function OrdersDashboard() {
  const [data, setData] = useState({});
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);

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

  const tabs = [
    { key: "pending", label: "🟡 Pending Assignment" },
    { key: "assigned", label: "🔵 Assigned" },
    { key: "packed", label: "🟠 Packed" },
    { key: "shipped", label: "🟣 Shipped" },
    { key: "delivered", label: "🟢 Delivered" },
  ];

  if (loading) return <h2 style={{ padding: 40 }}>Loading Orders...</h2>;

  return (
    <div style={{ padding: 20, maxWidth: 1300, margin: "auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        📦 Orders Dashboard
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        {tabs.map((t) => (
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
            {t.label} ({data[t.key]?.length || 0})
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div style={{ marginTop: 20 }}>
        {(data[activeTab] || []).length === 0 && (
          <p>No orders in this section</p>
        )}

        {(data[activeTab] || []).map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 15,
              marginBottom: 12,
              background: "#f9fafb",
            }}
          >
            {/* Basic Info */}
            <div style={{ marginBottom: 10 }}>
              <p><strong>Order ID:</strong> {order.orderId}</p>
              <p><strong>Customer:</strong> {order.customerName}</p>
              <p><strong>Status:</strong> {order.status}</p>

              {order.assignedStore && (
                <p>
                  <strong>Store:</strong> {order.assignedStore.name}
                </p>
              )}

              {order.warehouseAssignments?.length > 0 && (
                <p>
                  <strong>Warehouse:</strong>{" "}
                  {order.warehouseAssignments[0]?.warehouseId?.name}
                </p>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              {/* Assign button only in Pending */}
              {activeTab === "pending" && (
                <a href="/admin/orders/assign">
                  <button
                    style={{
                      padding: "8px 12px",
                      background: "#16a34a",
                      color: "#fff",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Assign Order
                  </button>
                </a>
              )}

              {/* Future: View details */}
              <a href={`/admin/orders/${order._id}`}>
                <button
                  style={{
                    padding: "8px 12px",
                    background: "#0ea5e9",
                    color: "#fff",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  View Details
                </button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
