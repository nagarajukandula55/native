"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      router.push("/login");
      return;
    }

    loadOrders(token);
  }, []);

  async function loadOrders(token) {
    try {
      const res = await fetch("/api/user/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        alert("Failed to load orders");
      }
    } catch (err) {
      console.error(err);
      alert("Error loading orders");
    }

    setLoading(false);
  }

  function logout() {
    localStorage.removeItem("userToken");
    router.push("/");
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "#16a34a";
      case "Shipped": return "#2563eb";
      case "Out For Delivery": return "#9333ea";
      case "Packed": return "#f59e0b";
      default: return "#777";
    }
  };

  if (loading) return <h2 style={{ padding: 40 }}>Loading...</h2>;

  return (
    <div style={container}>
      
      {/* HEADER */}
      <div style={header}>
        <h1>👤 My Account</h1>
        <button onClick={logout} style={logoutBtn}>Logout</button>
      </div>

      {/* ORDERS */}
      <h2 style={{ marginTop: 20 }}>📦 My Orders</h2>

      {orders.length === 0 && <p>No orders found</p>}

      {orders.map(order => (
        <div key={order._id} style={card}>
          
          {/* TOP */}
          <div style={row}>
            <div>
              <b>Order ID:</b> {order.orderId}
              <br />
              <small>{new Date(order.createdAt).toLocaleString()}</small>
            </div>

            <div style={{
              background: getStatusColor(order.status),
              color: "#fff",
              padding: "4px 10px",
              borderRadius: 6
            }}>
              {order.status}
            </div>
          </div>

          {/* ITEMS */}
          <div style={{ marginTop: 10 }}>
            {order.items?.map((item, i) => (
              <p key={i}>
                {item.name} — {item.quantity} × ₹{item.price}
              </p>
            ))}
          </div>

          {/* PAYMENT */}
          <p>
            <b>Payment:</b>{" "}
            <span style={{
              color: order.paymentStatus === "Paid" ? "green" : "orange",
              fontWeight: "bold"
            }}>
              {order.paymentStatus}
            </span>
          </p>

          {/* TOTAL */}
          <p><b>Total:</b> ₹{order.totalAmount}</p>

          {/* ACTIONS */}
          <div style={btnWrap}>
            <button
              onClick={() => router.push(`/track?orderId=${order.orderId}`)}
              style={trackBtn}
            >
              Track Order
            </button>

            {order.trackingUrl && (
              <a href={order.trackingUrl} target="_blank" style={shipBtn}>
                Track Shipment
              </a>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}

/* ===== STYLES ===== */

const container = {
  maxWidth: 900,
  margin: "auto",
  padding: 20,
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const logoutBtn = {
  padding: "8px 12px",
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};

const card = {
  background: "#fff",
  padding: 20,
  marginTop: 15,
  borderRadius: 10,
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const btnWrap = {
  marginTop: 10,
  display: "flex",
  gap: 10,
};

const trackBtn = {
  padding: "6px 12px",
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};

const shipBtn = {
  padding: "6px 12px",
  background: "#16a34a",
  color: "#fff",
  borderRadius: 6,
  textDecoration: "none",
};
