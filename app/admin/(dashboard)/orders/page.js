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
    setLoading(true);
    const res = await fetch("/api/admin/order");
    const json = await res.json();
    setData(json.grouped || {});
    setLoading(false);
  }

  const tabs = [
    { key: "pending", label: "🟡 Pending Assignment" },
    { key: "assigned", label: "🔵 Assigned" },
    { key: "packed", label: "🟠 Packed" },
    { key: "shipped", label: "🟣 Shipped" },
    { key: "delivered", label: "🟢 Delivered" },
  ];

  if (loading) return <h2 style={{ padding: 40 }}>Loading...</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>📦 Orders Dashboard</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "10px 15px",
              background: activeTab === t.key ? "#1e40af" : "#eee",
              color: activeTab === t.key ? "#fff" : "#000",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            {t.label} ({data[t.key]?.length || 0})
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div style={{ marginTop: 20 }}>
        {(data[activeTab] || []).map(order => (
          <div
            key={order._id}
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 15,
              marginBottom: 10,
              background: "#f9fafb"
            }}
          >
            <p><strong>Order:</strong> {order.orderId}</p>
            <p><strong>Customer:</strong> {order.customerName}</p>
            <p><strong>Status:</strong> {order.status}</p>

            {/* Show assign button ONLY in pending */}
            {activeTab === "pending" && (
              <a href="/admin/orders/assign">
                <button style={{
                  marginTop: 10,
                  padding: "6px 12px",
                  background: "#16a34a",
                  color: "#fff",
                  borderRadius: 6
                }}>
                  Assign Order
                </button>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
