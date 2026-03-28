"use client";

import { useEffect, useState } from "react";

export default function AssignOrders() {
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [ordersRes, storesRes, warehousesRes] = await Promise.all([
        fetch("/api/admin/order"),        // ✅ updated
        fetch("/api/admin/users"),
        fetch("/api/admin/warehouses"),
      ]);

      const ordersJson = await ordersRes.json();
      const storesJson = await storesRes.json();
      const warehousesJson = await warehousesRes.json();

      console.log("Orders API:", ordersJson);

      // ✅ ONLY pending orders
      setOrders(ordersJson.grouped?.pending || []);

      // ✅ store users only
      setStores(Array.isArray(storesJson) ? storesJson.filter(u => u.role === "store") : []);

      // ✅ warehouses fix
      setWarehouses(warehousesJson?.warehouses || []);

    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }

    setLoading(false);
  }

  async function handleAssign(orderId) {
    const { storeId, warehouseId } = selected[orderId] || {};

    if (!storeId && !warehouseId) {
      return alert("Select store and/or warehouse");
    }

    setAssigning(true);

    try {
      const res = await fetch("/api/admin/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, storeId, warehouseId }),
      });

      const json = await res.json();

      if (json.success) {
        alert("✅ Order Assigned Successfully");
        setSelected(prev => ({ ...prev, [orderId]: {} }));
        loadData();
      } else {
        alert(json.message || "Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setAssigning(false);
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading Orders...</h2>;

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        📝 Assign Orders
      </h1>

      {orders.length === 0 && (
        <p style={{ marginTop: 20 }}>No pending orders</p>
      )}

      {orders.map(order => (
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
            <p><strong>Order ID:</strong> {order.orderId}</p>
            <p><strong>Customer:</strong> {order.customerName}</p>
            <p><strong>Status:</strong> {order.status}</p>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            
            {/* Store Dropdown */}
            <select
              value={selected[order._id]?.storeId || ""}
              onChange={(e) =>
                setSelected(prev => ({
                  ...prev,
                  [order._id]: {
                    ...prev[order._id],
                    storeId: e.target.value
                  }
                }))
              }
            >
              <option value="">-- Select Store --</option>
              {stores.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} {s.warehouseName ? `(${s.warehouseName})` : ""}
                </option>
              ))}
            </select>

            {/* Warehouse Dropdown */}
            <select
              value={selected[order._id]?.warehouseId || ""}
              onChange={(e) =>
                setSelected(prev => ({
                  ...prev,
                  [order._id]: {
                    ...prev[order._id],
                    warehouseId: e.target.value
                  }
                }))
              }
            >
              <option value="">-- Select Warehouse --</option>
              {warehouses.map(w => (
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
                padding: "8px 14px",
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
