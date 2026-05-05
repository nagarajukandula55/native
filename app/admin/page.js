"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function AdminDashboard() {
  const socketRef = useRef(null);
  const mounted = useRef(false);

  const [activeTab, setActiveTab] = useState("ANU");

  const [events, setEvents] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);
  const [prs, setPrs] = useState([]);
  const [orders, setOrders] = useState([]);

  const [status, setStatus] = useState("connecting...");
  const [connected, setConnected] = useState(false);

  /* ================= SAFE ADD ================= */
  const addToState = (setter, data) => {
    setter((prev) => [data, ...prev].slice(0, 50));
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
      {
        transports: ["websocket"],
      }
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

    socket.on("ci_event", (data) =>
      addToState(setEvents, { ...data, time: new Date().toLocaleTimeString() })
    );

    socket.on("ai_patch", (data) =>
      addToState(setAiLogs, { ...data, time: new Date().toLocaleTimeString() })
    );

    socket.on("pr_created", (data) =>
      addToState(setPrs, { ...data, time: new Date().toLocaleTimeString() })
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "ORDERS") fetchOrders();
  }, [activeTab]);

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

    if (data.success) fetchOrders();
    else alert(data.message);
  };

  /* ================= UI ================= */
  return (
    <div className="container">
      {/* HEADER */}
      <div className="header">
        <h1>Admin Dashboard</h1>
        <div className={`status ${connected ? "ok" : "bad"}`}>
          {status}
        </div>
      </div>

      {/* TABS */}
      <div className="tabs">
        <button
          className={activeTab === "ANU" ? "active" : ""}
          onClick={() => setActiveTab("ANU")}
        >
          🧠 ANu
        </button>

        <button
          className={activeTab === "ORDERS" ? "active" : ""}
          onClick={() => setActiveTab("ORDERS")}
        >
          📦 Orders
        </button>
      </div>

      {/* ================= ANU TAB ================= */}
      {activeTab === "ANU" && (
        <div className="grid">
          <div className="card">
            <h2>🚨 CI Events</h2>
            {events.map((e, i) => (
              <pre key={i}>{JSON.stringify(e, null, 2)}</pre>
            ))}
          </div>

          <div className="card">
            <h2>🧠 AI Logs</h2>
            {aiLogs.map((a, i) => (
              <pre key={i}>{JSON.stringify(a, null, 2)}</pre>
            ))}
          </div>

          <div className="card">
            <h2>🚀 PRs</h2>
            {prs.map((p, i) => (
              <pre key={i}>{JSON.stringify(p, null, 2)}</pre>
            ))}
          </div>
        </div>
      )}

      {/* ================= ORDERS TAB ================= */}
      {activeTab === "ORDERS" && (
        <div>
          <h2>Orders</h2>

          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>{o.orderId}</td>
                  <td>{o.address?.name}</td>
                  <td>₹{o.amount}</td>
                  <td>{o.status}</td>

                  <td>
                    {o.status === "PENDING_PAYMENT" && (
                      <button onClick={() => updateStatus(o.orderId, "PAID")}>
                        Mark Paid
                      </button>
                    )}

                    {o.status === "PAID" && (
                      <button onClick={() => updateStatus(o.orderId, "PROCESSING")}>
                        Process
                      </button>
                    )}

                    {o.status === "PROCESSING" && (
                      <button onClick={() => updateStatus(o.orderId, "PACKED")}>
                        Pack
                      </button>
                    )}

                    {o.status === "PACKED" && (
                      <button onClick={() => updateStatus(o.orderId, "DISPATCHED")}>
                        Dispatch
                      </button>
                    )}

                    {o.status === "DISPATCHED" && (
                      <button onClick={() => updateStatus(o.orderId, "DELIVERED")}>
                        Deliver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* STYLES */}
      <style jsx>{`
        .container {
          padding: 20px;
          font-family: Arial;
          background: #0a0a0a;
          color: white;
          min-height: 100vh;
        }

        .header {
          display: flex;
          justify-content: space-between;
        }

        .status {
          padding: 5px 10px;
        }

        .ok {
          background: green;
        }

        .bad {
          background: red;
        }

        .tabs {
          margin-top: 20px;
        }

        .tabs button {
          margin-right: 10px;
          padding: 10px;
          cursor: pointer;
        }

        .active {
          background: white;
          color: black;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          margin-top: 20px;
        }

        .card {
          background: #111;
          padding: 10px;
        }

        table {
          width: 100%;
          margin-top: 20px;
          border-collapse: collapse;
        }

        td, th {
          border: 1px solid #333;
          padding: 10px;
        }

        button {
          padding: 5px 10px;
          background: black;
          color: white;
        }
      `}</style>
    </div>
  );
}
