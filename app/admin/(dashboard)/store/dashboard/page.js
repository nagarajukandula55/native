"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StoreDashboard() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token = localStorage.getItem("storeToken");

    if (!token) {
      router.push("/admin/store/login");
      return;
    }

    loadOrders(token);
  }, []);

  /* ================= LOAD ORDERS ================= */
  async function loadOrders(token) {
    setLoading(true);
    try {
      const res = await fetch("/api/store/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.success) {
        localStorage.removeItem("storeToken");
        router.push("/admin/store/login");
        return;
      }

      setOrders(
        data.orders.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to load orders");
    }

    setLoading(false);
  }

  /* ================= UPDATE ================= */
  async function updateOrder(id, field, value) {
    const token = localStorage.getItem("storeToken");

    try {
      setUpdatingId(id);

      const res = await fetch("/api/store/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, [field]: value }),
      });

      const data = await res.json();

      if (data.success) {
        await loadOrders(token);
      } else {
        alert("❌ Failed to update");
      }
    } catch (e) {
      console.error(e);
      alert("Server error");
    }

    setUpdatingId(null);
  }

  /* ================= LOGOUT ================= */
  function handleLogout() {
    localStorage.removeItem("storeToken");
    router.push("/admin/store/login");
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading Orders...</h2>;

  return (
    <div style={container}>
      <div style={header}>
        <h1>🏬 Store Dashboard</h1>
        <button onClick={handleLogout} style={logoutBtn}>
          Logout
        </button>
      </div>

      {orders.length === 0 && <p>No orders assigned.</p>}

      {orders.map((order) => (
        <div key={order._id} style={card}>
          <h3>Order ID: {order.orderId}</h3>

          <p><b>Customer:</b> {order.customerName}</p>
          <p><b>Phone:</b> {order.phone}</p>
          <p><b>Address:</b> {order.address} - {order.pincode}</p>
          <p><b>Total:</b> ₹{order.totalAmount}</p>

          <p><b>Status:</b> {order.status}</p>
          <p><b>Payment:</b> {order.paymentStatus}</p>

          {/* AWB INPUT */}
          <p>
            <b>AWB:</b>
            <input
              value={order.awb || ""}
              onChange={(e) =>
                updateOrder(order._id, "awb", e.target.value)
              }
              style={{ marginLeft: 10 }}
            />
          </p>

          {/* STATUS BUTTONS */}
          <div style={btnWrap}>
            {["Packed", "Shipped", "Out For Delivery", "Delivered"].map(
              (s) => (
                <button
                  key={s}
                  disabled={updatingId === order._id}
                  onClick={() => updateOrder(order._id, "status", s)}
                  style={btn}
                >
                  {s}
                </button>
              )
            )}
          </div>

          {/* PAYMENT BUTTONS */}
          <div style={btnWrap}>
            {["Pending", "Paid"].map((p) => (
              <button
                key={p}
                disabled={updatingId === order._id}
                onClick={() =>
                  updateOrder(order._id, "paymentStatus", p)
                }
                style={btn}
              >
                {p}
              </button>
            ))}
          </div>

          {/* ITEMS */}
          <h4>Items:</h4>
          {order.items.map((item, i) => (
            <p key={i}>
              {item.name} — {item.quantity} × ₹{item.price}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ================= STYLES ================= */
const container = { maxWidth: 1100, margin: "auto", padding: 30 };

const header = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 20,
};

const logoutBtn = {
  padding: "8px 14px",
  background: "red",
  color: "#fff",
  border: "none",
};

const card = {
  background: "#fff",
  padding: 20,
  marginBottom: 20,
  borderRadius: 10,
};

const btnWrap = {
  marginTop: 10,
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const btn = {
  padding: "6px 10px",
  background: "#333",
  color: "#fff",
  border: "none",
};
