"use client";

import { useEffect, useState } from "react";

export default function OrderDetails({ params }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, []);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/admin/order/${params.id}`);
      const json = await res.json();

      if (json.success) {
        setOrder(json.order);
      } else {
        alert(json.message || "Failed to load order");
      }
    } catch (err) {
      console.error(err);
      alert("Error loading order");
    }

    setLoading(false);
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading Order...</h2>;

  if (!order) return <h2 style={{ padding: 40 }}>Order not found</h2>;

  return (
    <div style={{ maxWidth: 1000, margin: "auto", padding: 20 }}>
      <h1 style={{ fontSize: 26, fontWeight: "bold" }}>
        📦 Order Details
      </h1>

      {/* Basic Info */}
      <div style={{ marginTop: 20 }}>
        <p><strong>Order ID:</strong> {order.orderId}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Customer:</strong> {order.customerName}</p>
        <p><strong>Phone:</strong> {order.phone}</p>
        <p><strong>Email:</strong> {order.email}</p>
        <p><strong>Address:</strong> {order.address}</p>
        <p><strong>Pincode:</strong> {order.pincode}</p>
      </div>

      {/* Store & Warehouse */}
      <div style={{ marginTop: 20 }}>
        <p>
          <strong>Store:</strong>{" "}
          {order.assignedStore?.name || "Not Assigned"}
        </p>

        <p>
          <strong>Warehouse:</strong>{" "}
          {order.warehouseAssignments?.[0]?.warehouseId?.name || "Not Assigned"}
        </p>
      </div>

      {/* Items */}
      <div style={{ marginTop: 25 }}>
        <h3>🛒 Items</h3>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={{ padding: 8 }}>Product</th>
              <th style={{ padding: 8 }}>Qty</th>
              <th style={{ padding: 8 }}>Price</th>
              <th style={{ padding: 8 }}>Total</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} style={{ textAlign: "center", borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{item.name}</td>
                <td style={{ padding: 8 }}>{item.quantity}</td>
                <td style={{ padding: 8 }}>₹{item.price}</td>
                <td style={{ padding: 8 }}>₹{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Timeline */}
      <div style={{ marginTop: 25 }}>
        <h3>📊 Status Timeline</h3>

        {order.statusHistory?.map((s, i) => (
          <div key={i} style={{ marginTop: 5 }}>
            {s.status} → {new Date(s.time).toLocaleString()}
          </div>
        ))}
      </div>
    </div>
  );
}
