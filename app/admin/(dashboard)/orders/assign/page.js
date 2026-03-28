"use client";

import { useEffect, useState } from "react";

export default function AssignOrders() {
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  // Load orders, stores, warehouses
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [ordersRes, storesRes, warehousesRes] = await Promise.all([
        fetch("/api/admin/order/unassigned"),
        fetch("/api/admin/users"),
        fetch("/api/admin/warehouses"),
      ]);

      const ordersJson = await ordersRes.json();
      const storesJson = await storesRes.json();
      const warehousesJson = await warehousesRes.json();

      setOrders(Array.isArray(ordersJson.orders) ? ordersJson.orders : []);
      setStores(Array.isArray(storesJson) ? storesJson.filter(u => u.role === "store") : []);
      setWarehouses(Array.isArray(warehousesJson.warehouses) ? warehousesJson.warehouses : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
    setLoading(false);
  }

  // Assign store + warehouse
  async function handleAssign(orderId, storeId, warehouseId) {
    if (!storeId || !warehouseId) return alert("Select both store and warehouse");

    setAssigning(true);
    try {
      const res = await fetch("/api/admin/order/assign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, storeId, warehouseId }),
      });

      const json = await res.json();
      if (json.success) {
        alert("✅ Order assigned successfully");
        // Update order in UI with inventory
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, assignedStore: storeId, inventory: json.inventory } : o));
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
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>📝 Assign Orders</h1>

      {orders.length === 0 && <p style={{ marginTop: 20 }}>No unassigned orders found.</p>}

      {orders.map((order) => (
        <div
          key={order._id}
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 15,
            marginTop: 15,
            background: "#f9fafb",
          }}
        >
          {/* Order Info */}
          <div style={{ marginBottom: 10 }}>
            <p><strong>Order ID:</strong> {order.orderId || order._id}</p>
            <p><strong>Status:</strong> {order.status || "Pending"}</p>
            <p><strong>Customer:</strong> {order.customerName}</p>
          </div>

          {/* Assignment Controls */}
          <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
            {/* Store Selection */}
            <select id={`store-${order._id}`} disabled={assigning}>
              <option value="">-- Assign to Store --</option>
              {stores.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} {s.warehouseName ? `(${s.warehouseName})` : ""}
                </option>
              ))}
            </select>

            {/* Warehouse Selection */}
            <select id={`warehouse-${order._id}`} disabled={assigning}>
              <option value="">-- Assign to Warehouse --</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>

            <button
              disabled={assigning}
              onClick={() => {
                const storeId = document.getElementById(`store-${order._id}`).value;
                const warehouseId = document.getElementById(`warehouse-${order._id}`).value;
                handleAssign(order._id, storeId, warehouseId);
              }}
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

          {/* Show Assigned Warehouse Inventory */}
          {Array.isArray(order.inventory) && order.inventory.length > 0 && (
            <div style={{ marginTop: 10, background: "#fff", padding: 10, borderRadius: 6 }}>
              <h4>Warehouse Inventory</h4>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #ccc" }}>
                    <th>SKU</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {order.inventory.map((inv) => (
                    <tr key={inv._id}>
                      <td>{inv.skuId?.name || "N/A"}</td>
                      <td>{inv.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
