"use client";

import { useEffect, useState } from "react";

export default function AssignOrders() {
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedStore, setSelectedStore] = useState({}); // { orderId: storeId }

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [ordersRes, storesRes] = await Promise.all([
        fetch("/api/admin/order/unassigned"),
        fetch("/api/admin/store"),
      ]);

      const ordersJson = await ordersRes.json();
      const storesJson = await storesRes.json();

      setOrders(ordersJson.orders || []);
      setStores(storesJson || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
    setLoading(false);
  }

  async function handleAssign(orderId) {
    const storeId = selectedStore[orderId];
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
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        📝 Assign Orders to Stores
      </h1>

      {orders.length === 0 && (
        <p style={{ marginTop: 20 }}>No unassigned orders found.</p>
      )}

      {orders.map((order) => {
        const selected = stores.find(
          (s) => s._id === selectedStore[order._id]
        );

        return (
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
            <div style={{ marginBottom: 10 }}>
              <p>
                <strong>Order ID:</strong> {order._id}
              </p>
              <p>
                <strong>Status:</strong> {order.status || "Pending"}
              </p>
            </div>

            <div style={{ display: "flex", gap: 15, alignItems: "flex-start" }}>
              {/* Store Dropdown */}
              <div>
                <select
                  value={selectedStore[order._id] || ""}
                  onChange={(e) =>
                    setSelectedStore({
                      ...selectedStore,
                      [order._id]: e.target.value,
                    })
                  }
                  disabled={assigning}
                  style={{ padding: 6, borderRadius: 6 }}
                >
                  <option value="">-- Select Store --</option>
                  {stores.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.warehouseName ? `(${s.warehouseName})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Warehouse Inventory */}
              {selected && selected.inventory?.length > 0 && (
                <div style={{ flex: 1 }}>
                  <strong>Warehouse Inventory:</strong>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginTop: 5,
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ border: "1px solid #ddd", padding: 6 }}>
                          Product
                        </th>
                        <th style={{ border: "1px solid #ddd", padding: 6 }}>
                          Available Qty
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.inventory.map((item) => (
                        <tr key={item.productId}>
                          <td style={{ border: "1px solid #ddd", padding: 6 }}>
                            {item.name}
                          </td>
                          <td style={{ border: "1px solid #ddd", padding: 6 }}>
                            {item.availableQty}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Assign Button */}
              <div>
                <button
                  disabled={assigning}
                  onClick={() => handleAssign(order._id)}
                  style={{
                    padding: "8px 15px",
                    background: "#1e40af",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    marginTop: 20,
                  }}
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
