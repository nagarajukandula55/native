"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function OrderDetailsPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();

        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  /* ================= ACTION ================= */
  const updateStatus = async (status) => {
    await fetch("/api/orders/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: order._id, status }),
    });

    location.reload();
  };

  const markPaid = async () => {
    const utr = prompt("Enter UTR (optional)");

    await fetch("/api/payment/mark-paid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: order.orderId,
        utr,
      }),
    });

    location.reload();
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!order) return <p style={{ padding: 20 }}>Order not found</p>;

  return (
    <div style={container}>

      {/* HEADER */}
      <h2>📦 Order Details</h2>

      <div style={card}>
        <h3>{order.orderId}</h3>
        <p>Status: <b>{order.status}</b></p>
        <p>Amount: ₹{order.amount}</p>
      </div>

      {/* CUSTOMER */}
      <div style={card}>
        <h3>👤 Customer</h3>
        <p>{order.address?.name}</p>
        <p>{order.address?.phone}</p>
        <p>{order.address?.email}</p>
        <p>{order.address?.address}</p>
        <p>{order.address?.city} - {order.address?.pincode}</p>
        <p>GST: {order.address?.gstNumber || "N/A"}</p>
      </div>

      {/* ITEMS */}
      <div style={card}>
        <h3>🛒 Items</h3>

        {order.items.map((item, i) => (
          <div key={i} style={itemRow}>
            <img src={item.image} width={60} />

            <div>
              <b>{item.name}</b>
              <p>Qty: {item.qty}</p>
              <p>Price: ₹{item.price}</p>
            </div>

            <div>
              <p>GST: {item.gstPercent}%</p>
              <p>Total: ₹{item.total}</p>
            </div>
          </div>
        ))}
      </div>

      {/* BILLING */}
      <div style={card}>
        <h3>💰 Billing</h3>

        <p>Subtotal: ₹{order.billing?.subtotal}</p>
        <p>Discount: ₹{order.billing?.discount}</p>
        <p>Taxable: ₹{order.billing?.taxableAmount}</p>

        <p>CGST: ₹{order.billing?.cgst}</p>
        <p>SGST: ₹{order.billing?.sgst}</p>
        <p>IGST: ₹{order.billing?.igst}</p>

        <h3>Grand Total: ₹{order.billing?.grandTotal}</h3>
      </div>

      {/* PAYMENT */}
      <div style={card}>
        <h3>💳 Payment</h3>

        <p>Method: {order.payment?.method}</p>
        <p>Status: {order.payment?.status}</p>
        <p>UTR: {order.payment?.utr || "N/A"}</p>
        <p>Paid At: {order.payment?.paidAt?.slice(0, 19)}</p>
      </div>

      {/* WAREHOUSE */}
      <div style={card}>
        <h3>🏭 Warehouse</h3>

        <p>Status: {order.warehouse?.status}</p>
        <p>Assigned: {order.warehouse?.assignedTo || "N/A"}</p>
      </div>

      {/* ACTIONS */}
      <div style={card}>
        <h3>⚙ Actions</h3>

        {order.payment?.status !== "SUCCESS" && (
          <button onClick={markPaid} style={btnGreen}>
            Mark Paid
          </button>
        )}

        <div style={{ marginTop: 10 }}>
          {["PROCESSING", "PACKED", "DISPATCHED", "DELIVERED"].map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              style={btnBlue}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* AUDIT */}
      <div style={card}>
        <h3>🧾 Audit Logs</h3>

        {order.auditLogs?.map((log, i) => (
          <div key={i} style={auditRow}>
            <b>{log.action}</b> | {log.from} → {log.to}
            <br />
            <small>{new Date(log.at).toLocaleString()}</small>
          </div>
        ))}
      </div>

    </div>
  );
}

/* ================= STYLES ================= */

const container = { padding: 20, maxWidth: 900, margin: "auto" };

const card = {
  background: "#fff",
  padding: 15,
  marginTop: 15,
  borderRadius: 10,
  border: "1px solid #eee",
};

const itemRow = {
  display: "flex",
  gap: 15,
  marginBottom: 10,
  alignItems: "center",
};

const auditRow = {
  background: "#f9f9f9",
  padding: 10,
  marginBottom: 8,
  borderRadius: 6,
};

const btnGreen = {
  background: "#16a34a",
  color: "#fff",
  padding: "8px 12px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const btnBlue = {
  background: "#2563eb",
  color: "#fff",
  padding: "6px 10px",
  border: "none",
  borderRadius: 6,
  marginRight: 5,
  cursor: "pointer",
};
