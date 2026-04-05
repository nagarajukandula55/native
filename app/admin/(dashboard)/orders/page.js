"use client";

import { useEffect, useState } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState({});
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadOrders();
    loadStores();
    loadWarehouses();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) setOrders(data.grouped);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function loadStores() {
    const res = await fetch("/api/admin/users?role=store");
    const data = await res.json();
    if (data.success) setStores(data.users);
  }

  async function loadWarehouses() {
    const res = await fetch("/api/admin/warehouses");
    const data = await res.json();
    if (data.success) setWarehouses(data.warehouses);
  }

  /* ================= ASSIGN ================= */
  async function assignOrder(orderId, storeId, warehouseId) {
    if (!storeId || !warehouseId) {
      return alert("Select store & warehouse");
    }

    setAssigning(true);

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, storeId, warehouseId }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
      } else {
        alert("✅ Order Assigned");
        loadOrders();
      }
    } catch (err) {
      console.error(err);
    }

    setAssigning(false);
  }

  /* ================= UI ================= */
  function renderOrders(list, title) {
    return (
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 10 }}>{title}</h2>

        {list?.length === 0 && <p>No orders</p>}

        {list?.map((order) => (
          <div key={order._id} style={card}>
            {/* HEADER */}
            <div style={header}>
              <div>
                <strong>{order.orderId}</strong>
                <p>{order.customerName}</p>
                <p>{order.phone}</p>
              </div>

              <div>
                <p>Status: {order.status}</p>
                <p>Total: ₹{order.totalAmount}</p>
              </div>
            </div>

            {/* ITEMS */}
            <div style={{ marginTop: 10 }}>
              {order.items.map((item, i) => (
                <div key={i}>
                  {item.name} × {item.quantity}
                </div>
              ))}
            </div>

            {/* ASSIGN */}
            {!order.assignedStore && (
              <div style={assignBox}>
                <select id={`store-${order._id}`}>
                  <option value="">Select Store</option>
                  {stores.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select id={`warehouse-${order._id}`}>
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() =>
                    assignOrder(
                      order._id,
                      document.getElementById(`store-${order._id}`).value,
                      document.getElementById(`warehouse-${order._id}`).value
                    )
                  }
                  disabled={assigning}
                  style={btn}
                >
                  Assign
                </button>
              </div>
            )}

            {/* ASSIGNED INFO */}
            {order.assignedStore && (
              <div style={{ marginTop: 10 }}>
                <strong>Store:</strong> {order.assignedStore?.name}
                <br />
                <strong>Warehouse:</strong>{" "}
                {order.warehouseAssignments?.[0]?.warehouseId?.name}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        📦 Admin Orders Control Panel
      </h1>

      {renderOrders(orders.pending, "🟥 Pending Orders")}
      {renderOrders(orders.assigned, "🟡 Assigned Orders")}
      {renderOrders(orders.packed, "🟦 Packed")}
      {renderOrders(orders.shipped, "🟪 Shipped")}
      {renderOrders(orders.delivered, "🟩 Delivered")}
    </div>
  );
}

/* ================= STYLES ================= */
const card = {
  border: "1px solid #eee",
  padding: 15,
  borderRadius: 8,
  marginBottom: 10,
  background: "#fff",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
};

const assignBox = {
  marginTop: 10,
  display: "flex",
  gap: 10,
};

const btn = {
  padding: "6px 12px",
  background: "#1e40af",
  color: "#fff",
  borderRadius: 6,
};
