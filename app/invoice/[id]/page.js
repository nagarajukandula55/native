"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ORDER ================= */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();

        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Invoice fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (loading) return <p>Loading receipt...</p>;
  if (!order) return <p>Receipt not found</p>;

  const company = {
    name: "Native",
    tagline: "Eat Healthy Stay Healthy",
  };

  return (
    <div className="invoice">

      {/* ================= HEADER ================= */}
      <div className="header">
        <div>
          <h2>{company.name}</h2>
          <small>{company.tagline}</small>
        </div>

        <div className="right">
          <h3>RECEIPT</h3>
          <p><b>Order:</b> {order.orderId}</p>
          <p><b>Status:</b> {order.status}</p>
        </div>
      </div>

      <hr />

      {/* ================= CUSTOMER ================= */}
      <div className="grid">
        <div>
          <h4>Bill To</h4>
          <p>{order.address?.name}</p>
          <p>{order.address?.phone}</p>
          <p>{order.address?.address}</p>
        </div>

        <div>
          <h4>Payment Info</h4>
          <p><b>Method:</b> {order.payment?.method || "Online"}</p>
          <p>
            <b>Reference:</b>{" "}
            {order.payment?.razorpay_payment_id || "NA"}
          </p>
          <p>
            <b>Receipt:</b>{" "}
            {order.receipt?.receiptNumber || "Pending"}
          </p>
        </div>
      </div>

      {/* ================= ITEMS ================= */}
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>GST%</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {order.items.map((item, i) => (
            <tr key={i}>
              <td>{item.name}</td>
              <td>{item.qty}</td>
              <td>₹{item.price}</td>
              <td>{item.gstPercent}%</td>
              <td>
                ₹{item.price * item.qty}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= TOTAL ================= */}
      <div className="totals">
        <p><b>Subtotal:</b> ₹{order.amount}</p>
        <p><b>GST Included</b></p>
        <h3>Total: ₹{order.amount}</h3>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="footer">
        <p>Thank you for shopping with {company.name}</p>
      </div>

      {/* ================= PRINT BUTTON ================= */}
      <button onClick={() => window.print()}>
        Print Receipt
      </button>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .invoice {
          max-width: 800px;
          margin: auto;
          padding: 20px;
          background: white;
        }

        .header {
          display: flex;
          justify-content: space-between;
        }

        .right {
          text-align: right;
        }

        .grid {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 8px;
        }

        th {
          background: #f5f5f5;
        }

        .totals {
          text-align: right;
          margin-top: 20px;
        }

        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 13px;
        }

        button {
          margin-top: 20px;
          padding: 10px;
          width: 100%;
          background: black;
          color: white;
        }
      `}</style>
    </div>
  );
}
