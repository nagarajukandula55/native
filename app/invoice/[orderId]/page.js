"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ReceiptPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ORDER ================= */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
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

    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) return <p>Loading receipt...</p>;
  if (!order) return <p>Order not found</p>;

  const {
    receipt,
    payment,
    items,
    amount,
    address,
    gstSummary = {},
  } = order;

  return (
    <div className="page">

      {/* ================= COMPANY HEADER ================= */}
      <div className="header">
        <img src="/logo.png" alt="logo" className="logo" />

        <div>
          <h2>Native Foods</h2>
          <p>Eat Healthy Stay Healthy</p>
          <p>GSTIN: 37XXXXXXXXXX</p>
        </div>
      </div>

      {/* ================= RECEIPT INFO ================= */}
      <div className="box">
        <h3>Payment Receipt</h3>

        <p><b>Receipt No:</b> {receipt?.receiptNumber}</p>
        <p><b>Order ID:</b> {order.orderId}</p>
        <p><b>Date:</b> {new Date(receipt?.generatedAt).toLocaleString()}</p>
        <p><b>Payment Mode:</b> {payment?.razorpay_payment_id ? "Razorpay" : "UPI"}</p>
        <p><b>Payment Ref:</b> {payment?.razorpay_payment_id || "UPI/Manual"}</p>
      </div>

      {/* ================= CUSTOMER ================= */}
      <div className="box">
        <h3>Customer Details</h3>
        <p>{address?.name}</p>
        <p>{address?.phone}</p>
        <p>{address?.address}</p>
        <p>{address?.state}</p>
        {address?.gstNumber && <p>GST: {address.gstNumber}</p>}
      </div>

      {/* ================= ITEMS ================= */}
      <div className="box">
        <h3>Items</h3>

        {items?.map((item, i) => (
          <div key={i} className="row">
            <span>{item.name} x {item.qty}</span>
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="box">
        <h3>Summary</h3>

        <div className="row"><span>Subtotal</span><span>₹{gstSummary.subtotal}</span></div>
        <div className="row"><span>GST</span><span>₹{gstSummary.gstTotal}</span></div>

        <hr />

        <div className="row total">
          <b>Total Paid</b>
          <b>₹{amount}</b>
        </div>
      </div>

      {/* ================= PRINT ================= */}
      <button onClick={() => window.print()}>
        Print Receipt
      </button>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .page {
          max-width: 800px;
          margin: auto;
          padding: 20px;
          font-family: system-ui;
        }

        .header {
          display: flex;
          gap: 20px;
          align-items: center;
          margin-bottom: 20px;
        }

        .logo {
          width: 80px;
        }

        .box {
          border: 1px solid #eee;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 10px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }

        .total {
          font-size: 18px;
        }

        button {
          width: 100%;
          padding: 10px;
          background: black;
          color: white;
          border: none;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
