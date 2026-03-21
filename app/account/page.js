"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      router.push("/login");
      return;
    }

    loadOrders(token);
  }, []);

  async function loadOrders(token) {
    const res = await fetch("/api/user/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (data.success) setOrders(data.orders);
  }

  function logout() {
    localStorage.removeItem("userToken");
    router.push("/");
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>My Account</h1>
      <button onClick={logout}>Logout</button>

      <h2 style={{ marginTop: 20 }}>My Orders</h2>

      {orders.map(order => (
        <div key={order._id} style={{ marginTop: 10, padding: 10, border: "1px solid #ccc" }}>
          <p>Order ID: {order.orderId}</p>
          <p>Status: {order.status}</p>
          <p>Total: ₹{order.totalAmount}</p>
        </div>
      ))}
    </div>
  );
}
