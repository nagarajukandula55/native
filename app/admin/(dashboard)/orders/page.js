"use client";

import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data.orders || []);
  }

  return (
    <div>
      <h1>Orders</h1>

      {orders.map((o) => (
        <div
          key={o._id}
          style={{
            border: "1px solid #ddd",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <p><b>{o.orderId}</b></p>
          <p>{o.customerName}</p>
          <p>Status: {o.status}</p>
        </div>
      ))}
    </div>
  );
}
