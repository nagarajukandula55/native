"use client";

import { useEffect, useState } from "react";

export default function AssignOrders() {
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  // Selected store & warehouse per order
  const [selectedStore, setSelectedStore] = useState({});
  const [selectedWarehouse, setSelectedWarehouse] = useState({});

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

  async function handleAssign(orderId) {
    const storeId = selectedStore[orderId];
    const warehouseId = selectedWarehouse[orderId];

    if (!storeId || !warehouseId) return alert("Please select both store and warehouse");

    if (!confirm("Are you sure you want to assign this order?")) return;

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
            <select
              value={selectedStore[order._id] || ""}
              disabled={assigning}
              onChange={(e) => setSelectedStore({ ...selectedStore, [order._id]: e.target.value })}
            >
              <option value="">-- Select Store --</option>
              {stores.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} {s.warehouseName ? `(${s.warehouseName})` : ""}
                </option>
              ))}
            </select>

            {/* Warehouse Selection */}
            <select
              value={selectedWarehouse[order._id] || ""}
              disabled={assigning}
              onChange={(e) => setSelectedWarehouse({ ...selectedWarehouse, [order._id]: e.target.value })}
            >
              <option value="">-- Select Warehouse --</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>

            {/* Assign Button */}
            <button
              disabled={assigning}
              onClick={() => handleAssign(order._id)}
              style={{
                padding: "6px 12px",
                background: "#4CAF50",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {assigning ? "Assigning..." : "Assign"}
            </button>
          </div>

          {/* Warehouse Inventory (if already assigned) */}
          {order.assignedStore && order.warehouseAssignments?.length > 0 && (
            <div style={{ marginTop: 10, background: "#fff", padding: 10, borderRadius: 6 }}>
              <h4>Warehouse Inventory</h4>
              {Array.isArray(order.inventory) && order.inventory.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #ccc" }}>
                      <th>SKU</th>
                      <th>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.inventory.map(inv => (
                      <tr key={inv._id}>
                        <td>{inv.skuId?.name || "N/A"}</td>
                        <td>{inv.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No inventory available.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
