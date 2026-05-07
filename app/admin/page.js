"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function AdminDashboard() {

  const socketRef = useRef(null);
  const mounted = useRef(false);

  /* ================= STATES ================= */
  const [activeTab, setActiveTab] = useState("ORDERS");

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [status, setStatus] = useState("connecting...");
  const [connected, setConnected] = useState(false);

  const [paymentModes, setPaymentModes] = useState({
    razorpay: true,
    cod: true,
    upi: true,
  });

  /* ================= SOCKET ================= */
  useEffect(() => {

    if (mounted.current) return;

    mounted.current = true;

    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      "http://localhost:5000"
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

    try {

      const res = await fetch("/api/admin/orders");

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
      }

    } catch (err) {
      console.log(err);
    }
  };

  /* ================= FETCH PAYMENT SETTINGS ================= */
  const fetchPaymentModes = async () => {

    try {

      const res = await fetch("/api/admin/payment-settings");

      const data = await res.json();

      if (data.success) {
        setPaymentModes(data.settings);
      }

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {

    fetchOrders();
    fetchPaymentModes();

  }, []);

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (orderId, status) => {

    const res = await fetch("/api/orders/status", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        orderId,
        status,
      }),
    });

    const data = await res.json();

    if (data.success) {

      fetchOrders();

      setSelectedOrder(null);

    } else {

      alert(data.message);
    }
  };

  /* ================= MARK AS PAID ================= */
  const markAsPaid = async (orderId, utr) => {

    const res = await fetch("/api/orders/mark-paid", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        orderId,
        utr,
      }),
    });

    const data = await res.json();

    if (data.success) {

      alert("Marked as Paid ✅");

      fetchOrders();

      setSelectedOrder(null);

    } else {

      alert(data.message);
    }
  };

  /* ================= TOGGLE PAYMENT MODE ================= */
  const togglePaymentMode = async (key) => {

    try {

      const updated = {
        ...paymentModes,
        [key]: !paymentModes[key],
      };

      setPaymentModes(updated);

      const res = await fetch(
        "/api/admin/payment-settings",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(updated),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert("Failed to update");
      }

    } catch (err) {

      console.log(err);

      alert("Error updating payment mode");
    }
  };

  /* ================= UI ================= */
  return (

    <div className="container">

      {/* ================= HEADER ================= */}
      <div className="topbar">

        <div>
          <h1>🛍️ ShopNative Admin</h1>

          <p>
            Socket: {status}
          </p>
        </div>

        <div className="badge">
          {connected ? "LIVE" : "OFFLINE"}
        </div>

      </div>

      {/* ================= TABS ================= */}
      <div className="tabs">

        <button
          className={
            activeTab === "ORDERS"
              ? "tab active"
              : "tab"
          }
          onClick={() => setActiveTab("ORDERS")}
        >
          📦 Orders
        </button>

        <button
          className={
            activeTab === "PAYMENTS"
              ? "tab active"
              : "tab"
          }
          onClick={() => setActiveTab("PAYMENTS")}
        >
          💳 Payment Modes
        </button>

      </div>

      {/* ================= ORDERS TAB ================= */}
      {activeTab === "ORDERS" && (

        <div className="card">

          <div className="cardHeader">

            <h2>📦 Orders</h2>

            <button onClick={fetchOrders}>
              Refresh
            </button>

          </div>

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

                <tr
                  key={o._id}
                  onClick={() => setSelectedOrder(o)}
                >
                  <td>{o.orderId}</td>

                  <td>{o.address?.name}</td>

                  <td>₹{o.amount}</td>

                  <td>
                    <span className="status">
                      {o.status}
                    </span>
                  </td>
                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

      {/* ================= PAYMENT TAB ================= */}
      {activeTab === "PAYMENTS" && (

        <div className="grid">

          <div className="paymentCard">

            <div>
              <h2>Razorpay</h2>
              <p>Online payment gateway</p>
            </div>

            <button
              className={
                paymentModes.razorpay
                  ? "disableBtn"
                  : "enableBtn"
              }
              onClick={() =>
                togglePaymentMode("razorpay")
              }
            >
              {paymentModes.razorpay
                ? "Disable"
                : "Enable"}
            </button>

          </div>

          <div className="paymentCard">

            <div>
              <h2>Cash On Delivery</h2>
              <p>Allow COD orders</p>
            </div>

            <button
              className={
                paymentModes.cod
                  ? "disableBtn"
                  : "enableBtn"
              }
              onClick={() =>
                togglePaymentMode("cod")
              }
            >
              {paymentModes.cod
                ? "Disable"
                : "Enable"}
            </button>

          </div>

          <div className="paymentCard">

            <div>
              <h2>Direct UPI</h2>
              <p>Manual UPI payments</p>
            </div>

            <button
              className={
                paymentModes.upi
                  ? "disableBtn"
                  : "enableBtn"
              }
              onClick={() =>
                togglePaymentMode("upi")
              }
            >
              {paymentModes.upi
                ? "Disable"
                : "Enable"}
            </button>

          </div>

        </div>

      )}

      {/* ================= DRAWER ================= */}
      {selectedOrder && (

        <div className="drawer">

          <div className="drawerContent">

            <button
              className="close"
              onClick={() =>
                setSelectedOrder(null)
              }
            >
              ✖
            </button>

            <h2>
              Order: {selectedOrder.orderId}
            </h2>

            {/* CUSTOMER */}
            <h3>👤 Customer</h3>

            <p>{selectedOrder.address?.name}</p>
            <p>{selectedOrder.address?.phone}</p>
            <p>{selectedOrder.address?.address}</p>

            {/* ITEMS */}
            <h3>🛒 Items</h3>

            {selectedOrder.items.map(
              (item, i) => (

                <div key={i} className="item">

                  <div>
                    {item.name ||
                      item.productKey}
                  </div>

                  <div>
                    ₹{item.price} × {item.qty}
                  </div>

                  <div>
                    GST: {item.gstPercent}%
                  </div>

                  <div>
                    Total: ₹{item.total}
                  </div>

                </div>

              )
            )}

            {/* BILLING */}
            <h3>💰 Billing</h3>

            <p>
              Subtotal: ₹
              {selectedOrder.billing?.subtotal}
            </p>

            <p>
              CGST: ₹
              {selectedOrder.billing?.cgst}
            </p>

            <p>
              SGST: ₹
              {selectedOrder.billing?.sgst}
            </p>

            <h2>
              Total: ₹
              {
                selectedOrder.billing
                  ?.grandTotal
              }
            </h2>

            {/* PAYMENT */}
            <h3>💳 Payment</h3>

            <p>
              Method:{" "}
              {
                selectedOrder.payment?.method
              }
            </p>

            <p>
              Status:{" "}
              {
                selectedOrder.payment?.status
              }
            </p>

            {/* ACTIONS */}
            <h3>⚙️ Actions</h3>

            {selectedOrder.status ===
              "PENDING_PAYMENT" && (
              <>
                <input
                  placeholder="Enter UTR / Ref No"
                  id="utrInput"
                  className="input"
                />

                <button
                  onClick={() => {

                    const utr =
                      document.getElementById(
                        "utrInput"
                      ).value;

                    markAsPaid(
                      selectedOrder.orderId,
                      utr
                    );
                  }}
                >
                  ✅ Mark as Paid
                </button>
              </>
            )}

            {selectedOrder.status ===
              "PAID" && (
              <button
                onClick={() =>
                  updateStatus(
                    selectedOrder.orderId,
                    "PROCESSING"
                  )
                }
              >
                Process
              </button>
            )}

            {selectedOrder.status ===
              "PROCESSING" && (
              <button
                onClick={() =>
                  updateStatus(
                    selectedOrder.orderId,
                    "PACKED"
                  )
                }
              >
                Pack
              </button>
            )}

            {selectedOrder.status ===
              "PACKED" && (
              <button
                onClick={() =>
                  updateStatus(
                    selectedOrder.orderId,
                    "DISPATCHED"
                  )
                }
              >
                Dispatch
              </button>
            )}

            {selectedOrder.status ===
              "DISPATCHED" && (
              <button
                onClick={() =>
                  updateStatus(
                    selectedOrder.orderId,
                    "DELIVERED"
                  )
                }
              >
                Deliver
              </button>
            )}

          </div>

        </div>

      )}

      {/* ================= STYLES ================= */}
      <style jsx>{`

        .container {
          background: #050505;
          min-height: 100vh;
          color: white;
          padding: 20px;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .badge {
          background: #00aa55;
          padding: 10px 16px;
          border-radius: 999px;
          font-weight: bold;
        }

        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .tab {
          background: #151515;
          border: 1px solid #333;
          color: white;
          padding: 12px 18px;
          border-radius: 12px;
          cursor: pointer;
        }

        .active {
          background: white;
          color: black;
        }

        .card {
          background: #111;
          border-radius: 20px;
          padding: 20px;
          border: 1px solid #222;
        }

        .cardHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        td, th {
          border-bottom: 1px solid #222;
          padding: 14px;
          text-align: left;
        }

        tr:hover {
          background: #181818;
        }

        .status {
          background: #222;
          padding: 6px 12px;
          border-radius: 999px;
        }

        .grid {
          display: grid;
          gap: 20px;
        }

        .paymentCard {
          background: #111;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #222;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .enableBtn {
          background: #00aa55;
          color: white;
        }

        .disableBtn {
          background: #cc0000;
          color: white;
        }

        button {
          border: none;
          padding: 12px 18px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: bold;
        }

        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 420px;
          height: 100%;
          background: #111;
          overflow-y: auto;
          box-shadow: -2px 0 20px rgba(0,0,0,0.5);
          z-index: 1000;
        }

        .drawerContent {
          padding: 20px;
        }

        .close {
          background: red;
          color: white;
          width: 40px;
          height: 40px;
          float: right;
        }

        .item {
          border-bottom: 1px solid #222;
          padding: 12px 0;
        }

        .input {
          width: 100%;
          padding: 12px;
          margin-top: 10px;
          margin-bottom: 10px;
          border-radius: 10px;
          border: 1px solid #333;
          background: #000;
          color: white;
        }

      `}</style>

    </div>
  );
}
