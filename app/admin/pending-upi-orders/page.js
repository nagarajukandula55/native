"use client";

import { useState, useEffect } from "react";

export default function PendingUPIOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) setOrders(data.orders.filter(o => o.paymentMethod === "UPI" && o.paymentStatus === "Pending"));
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function markPaid(id) {
    try {
      const res = await fetch("/api/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "Paid" }) });
      const data = await res.json();
      if (data.success) loadOrders();
    } catch (err) { console.error(err); }
  }

  if (loading) return <h2>Loading Pending UPI Orders...</h2>;

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 20 }}>
      <h1>Pending UPI Orders</h1>
      {orders.length === 0 && <p>No pending UPI orders</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
        <thead>
          <tr style={{ background: "#f1f5f9" }}>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{o.orderId}</td>
              <td>{o.customerName}</td>
              <td>{o.phone}</td>
              <td>₹{o.totalAmount}</td>
              <td>
                <button onClick={() => markPaid(o._id)} style={{ padding: "6px 12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                  Mark Paid
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
