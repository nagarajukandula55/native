"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ReceiptPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchReceipt = async () => {
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

    if (id) fetchReceipt();
  }, [id]);

  if (loading) return <p>Loading receipt...</p>;
  if (!order) return <p>Receipt not found</p>;

  return (
    <div className="receipt-page">

      {/* ================= HEADER (LOGO ONLY) ================= */}
      <div className="header">
        <img src="/logo.png" alt="logo" className="logo" />

        <div className="right">
          <h2>PAYMENT RECEIPT</h2>
          <p>Order ID: {order.orderId}</p>
          <p>Status: {order.status}</p>
        </div>
      </div>

      <hr />

      {/* ================= CUSTOMER ================= */}
      <div className="grid">
        <div>
          <h4>Customer</h4>
          <p>{order.address?.name}</p>
          <p>{order.address?.phone}</p>
          <p>{order.address?.address}</p>
        </div>

        <div>
          <h4>Payment Details</h4>
          <p>
            <b>Method:</b> {order.payment?.method || "Online"}
          </p>
          <p>
            <b>Reference:</b>{" "}
            {order.payment?.razorpay_payment_id || order.payment?.utr || "NA"}
          </p>
          <p>
            <b>Receipt No:</b>{" "}
            {order.receipt?.receiptNumber || "Generating..."}
          </p>
        </div>
      </div>

      {/* ================= ITEMS ================= */}
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {order.items.map((item, i) => (
            <tr key={i}>
              <td>{item.name}</td>
              <td>{item.qty}</td>
              <td>₹{item.price * item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= TOTAL ================= */}
      <div className="total">
        <h3>Total Paid: ₹{order.amount}</h3>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="footer">
        <p>Thank you for your payment 💚</p>
      </div>

      {/* ================= PRINT ================= */}
      <button onClick={() => window.print()}>Print Receipt</button>

      {/* ================= STYLES (PRINT LOCKED) ================= */}
      <style jsx>{`
        .receipt-page {
          max-width: 800px;
          margin: auto;
          padding: 20px;
          background: white;
          font-family: Arial;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          width: 120px;
          object-fit: contain;
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
        }

        th, td {
          border: 1px solid #ddd;
          padding: 8px;
        }

        th {
          background: #f5f5f5;
        }

        .total {
          text-align: right;
          margin-top: 20px;
        }

        .footer {
          text-align: center;
          margin-top: 40px;
        }

        button {
          margin-top: 20px;
          width: 100%;
          padding: 10px;
          background: black;
          color: white;
        }

        /* ================= PRINT LOCK ================= */
        @media print {
          body * {
            visibility: hidden;
          }

          .receipt-page,
          .receipt-page * {
            visibility: visible;
          }

          .receipt-page {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }

          button {
            display: none !important;
          }

          nav, footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
