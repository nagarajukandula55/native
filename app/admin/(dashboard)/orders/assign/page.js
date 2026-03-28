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
      setWarehouses(Array.isArray(warehousesJson) ? warehousesJson : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
    setLoading(false);
  }

  // Assign order to store
  async function handleAssignStore(orderId, storeId) {
    if (!storeId) return alert("Select a store first");
    setAssigning(true);

    try {
      const res = await fetch("/api/admin/order/assign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, storeId }),
      });
      const json = await res.json();
      if (json.success) {
        alert("✅ Order assigned to store successfully");
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

  // Assign order to warehouse
  async function handleAssignWarehouse(orderId, warehouseId) {
    if (!warehouseId) return alert("Select a warehouse first");
    setAssigning(true);

    try {
      const res = await fetch("/api/admin/order/assignWarehouse", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, warehouseId }),
      });
      const json = await res.json();
      if (json.success) {
        alert("✅ Order assigned to warehouse successfully");
        loadData();
      } else {
        alert(json.message || "Failed to assign warehouse");
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

      {Array.isArray(orders) && orders.map((order) => (
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
              defaultValue=""
              onChange={(e) => handleAssignStore(order._id, e.target.value)}
              disabled={assigning}
            >
              <option value="">-- Assign to Store --</option>
              {Array.isArray(stores) && stores.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} {s.warehouseName ? `(${s.warehouseName})` : ""}
                </option>
              ))}
            </select>

            {/* Warehouse Selection */}
            <select
              defaultValue=""
              onChange={(e) => handleAssignWarehouse(order._id, e.target.value)}
              disabled={assigning}
            >
              <option value="">-- Assign to Warehouse --</option>
              {Array.isArray(warehouses) && warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>

          {/* Show Assigned Warehouse Inventory */}
          {order.assignedStore && order.assignedStore.warehouseId && (
            <div style={{ marginTop: 10, background: "#fff", padding: 10, borderRadius: 6 }}>
              <h4>Warehouse Inventory</h4>
              {Array.isArray(order.inventory) && order.inventory.length > 0 ? (
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
              ) : (
                <p>No inventory available for this warehouse.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
