"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function AdminDashboard() {
  const socketRef = useRef(null);
  const mounted = useRef(false);

  const [activeTab, setActiveTab] = useState("ORDERS");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [status, setStatus] = useState("connecting...");
  const [connected, setConnected] = useState(false);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected 🟢");
      setConnected(true);
      socket.emit("register", "shopnative");
    });

    socket.on("disconnect", () => {
      setStatus("disconnected 🔴");
      setConnected(false);
    });

    return () => socket.disconnect();
  }, []);

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    if (data.success) setOrders(data.orders);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ================= STATUS UPDATE ================= */
  const updateStatus = async (orderId, status) => {
    const res = await fetch("/api/orders/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, status }),
    });

    const data = await res.json();

    if (data.success) {
      fetchOrders();
      setSelectedOrder(null);
    } else {
      alert(data.message);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container">

      <h1>📦 Orders Dashboard</h1>

      {/* TABLE */}
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Name</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o._id} onClick={() => setSelectedOrder(o)}>
              <td>{o.orderId}</td>
              <td>{o.address?.name}</td>
              <td>₹{o.amount}</td>
              <td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= DRAWER ================= */}
      {selectedOrder && (
        <div className="drawer">
          <div className="drawerContent">

            <button className="close" onClick={() => setSelectedOrder(null)}>
              ✖
            </button>

            <h2>Order: {selectedOrder.orderId}</h2>

            {/* CUSTOMER */}
            <h3>👤 Customer</h3>
            <p>{selectedOrder.address?.name}</p>
            <p>{selectedOrder.address?.phone}</p>
            <p>{selectedOrder.address?.address}</p>

            {/* ITEMS */}
            <h3>🛒 Items</h3>
            {selectedOrder.items.map((item, i) => (
              <div key={i} className="item">
                <div>{item.name || item.productKey}</div>
                <div>₹{item.price} × {item.qty}</div>
                <div>GST: {item.gstPercent}%</div>
                <div>Total: ₹{item.total}</div>
              </div>
            ))}

            {/* BILLING */}
            <h3>💰 Billing</h3>
            <p>Subtotal: ₹{selectedOrder.billing?.subtotal}</p>
            <p>Discount: ₹{selectedOrder.billing?.discount}</p>
            <p>Taxable: ₹{selectedOrder.billing?.taxableAmount}</p>

            <p>CGST: ₹{selectedOrder.billing?.cgst}</p>
            <p>SGST: ₹{selectedOrder.billing?.sgst}</p>
            <p>IGST: ₹{selectedOrder.billing?.igst}</p>

            <h2>Total: ₹{selectedOrder.billing?.grandTotal}</h2>

            {/* PAYMENT */}
            <h3>💳 Payment</h3>
            <p>Method: {selectedOrder.payment?.method}</p>
            <p>Status: {selectedOrder.payment?.status}</p>

            {/* STATUS ACTION */}
            <h3>⚙️ Actions</h3>

            {selectedOrder.status === "PENDING_PAYMENT" && (
              <button onClick={() => updateStatus(selectedOrder.orderId, "PAID")}>
                Mark Paid
              </button>
            )}

            {selectedOrder.status === "PAID" && (
              <button onClick={() => updateStatus(selectedOrder.orderId, "PROCESSING")}>
                Process
              </button>
            )}

            {selectedOrder.status === "PROCESSING" && (
              <button onClick={() => updateStatus(selectedOrder.orderId, "PACKED")}>
                Pack
              </button>
            )}

            {selectedOrder.status === "PACKED" && (
              <button onClick={() => updateStatus(selectedOrder.orderId, "DISPATCHED")}>
                Dispatch
              </button>
            )}

            {selectedOrder.status === "DISPATCHED" && (
              <button onClick={() => updateStatus(selectedOrder.orderId, "DELIVERED")}>
                Deliver
              </button>
            )}

            {/* AUDIT LOG */}
            <h3>📜 Audit</h3>
            {selectedOrder.auditLogs?.map((log, i) => (
              <div key={i}>
                {log.action} ({log.from} → {log.to})
              </div>
            ))}

          </div>
        </div>
      )}

      {/* STYLES */}
      <style jsx>{`
        .container {
          padding: 20px;
          background: #0a0a0a;
          color: white;
        }

        table {
          width: 100%;
          margin-top: 20px;
          border-collapse: collapse;
        }

        td, th {
          border: 1px solid #333;
          padding: 10px;
          cursor: pointer;
        }

        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 400px;
          height: 100%;
          background: #111;
          box-shadow: -2px 0 10px rgba(0,0,0,0.5);
          overflow-y: auto;
        }

        .drawerContent {
          padding: 20px;
        }

        .close {
          float: right;
          background: red;
          color: white;
          border: none;
          padding: 5px;
        }

        .item {
          border-bottom: 1px solid #333;
          margin-bottom: 10px;
          padding-bottom: 10px;
        }

        button {
          margin-top: 10px;
          padding: 8px;
          background: black;
          color: white;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
