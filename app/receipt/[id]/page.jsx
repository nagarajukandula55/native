"use client";

import { useEffect, useState } from "react";

export default function ReceiptPage({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        const json = await res.json();

        if (json.success) {
          setData(json.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) load();
  }, [params.id]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Receipt not found</p>;

  const print = () => window.print();

  return (
    <div className="page">
      <div className="receipt" id="receipt">

        {/* ================= HEADER ================= */}
        <div className="header">
          <img src="/logo.png" className="logo" />

          <div className="meta">
            <h2>PAYMENT RECEIPT</h2>
            <p>Order ID: {data.orderId}</p>
            <p>Status: {data.status}</p>
          </div>
        </div>

        <hr />

        {/* ================= CUSTOMER ================= */}
        <div className="grid">
          <div>
            <h4>Customer</h4>
            <p>{data.address?.name}</p>
            <p>{data.address?.phone}</p>
            <p>{data.address?.address}</p>
          </div>

          <div>
            <h4>Payment</h4>
            <p>
              <b>Method:</b> {data.payment?.method || "ONLINE"}
            </p>
            <p>
              <b>Reference:</b>{" "}
              {data.payment?.razorpay_payment_id ||
                data.payment?.upi_ref ||
                data.receipt?.paymentReference ||
                "NA"}
            </p>
            <p>
              <b>Receipt No:</b>{" "}
              {data.receipt?.receiptNumber || "Generating..."}
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
            {data.items.map((i, idx) => (
              <tr key={idx}>
                <td>{i.name}</td>
                <td>{i.qty}</td>
                <td>₹{i.price * i.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= TOTAL ================= */}
        <div className="total">
          <h3>Total Paid: ₹{data.amount}</h3>
        </div>

        <button onClick={print}>Print Receipt</button>
      </div>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .page {
          display: flex;
          justify-content: center;
          padding: 20px;
        }

        .receipt {
          width: 420px;
          background: white;
          padding: 20px;
          border: 1px solid #ddd;
        }

        .header {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .logo {
          width: 70px;
        }

        .meta {
          flex: 1;
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

        th,
        td {
          border-bottom: 1px solid #eee;
          padding: 6px;
        }

        .total {
          text-align: right;
          margin-top: 15px;
        }

        button {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          background: black;
          color: white;
        }

        /* ================= PRINT LOCK ================= */
        @media print {
          body * {
            visibility: hidden;
          }

          #receipt,
          #receipt * {
            visibility: visible;
          }

          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
