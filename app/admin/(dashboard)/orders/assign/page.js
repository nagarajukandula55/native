"use client";

import { useEffect, useState } from "react";

export default function AssignOrders() {
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [ordersRes, storesRes] = await Promise.all([
        fetch("/api/admin/orders/unassigned"),
        fetch("/api/admin/users"),
      ]);

      const ordersJson = await ordersRes.json();
      const storesJson = await storesRes.json();

      setOrders(ordersJson.orders || []);
      // Only store role users
      setStores(storesJson.filter((u) => u.role === "store"));
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
    setLoading(false);
  }

  async function handleAssign(orderId, storeId) {
    if (!storeId) return alert("Select a store first");
    setAssigning(true);

    try {
      const res = await fetch("/api/admin/orders/assign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, storeId }),
      });

      const json = await res.json();
      if (json.success) {
        alert("Order assigned successfully");
        loadData();
      } else {
        alert(json.message || "Failed to assign order");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setAssigning(false);
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading orders...</h2>;

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>📝 Assign Orders to Stores</h1>

      {orders.length === 0 && <p style={{ marginTop: 20 }}>No unassigned orders found.</p>}

      {orders.map((order) => (
        <div
          key={order._id}
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 15,
            marginTop: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f9fafb",
          }}
        >
          <div>
            <p>
              <strong>Order ID:</strong> {order._id}
            </p>
            <p>
              <strong>Status:</strong> {order.status || "Pending"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <select
              defaultValue=""
              onChange={(e) => handleAssign(order._id, e.target.value)}
              disabled={assigning}
            >
              <option value="">-- Select Store --</option>
              {stores.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} {s.warehouseName ? `(${s.warehouseName})` : ""}
                </option>
              ))}
            </select>
            <button
              disabled={assigning}
              onClick={() => alert("Select a store from dropdown to assign")}
              style={{
                padding: "8px 15px",
                background: "#1e40af",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Assign
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
