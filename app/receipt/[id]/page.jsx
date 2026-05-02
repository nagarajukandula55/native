"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ReceiptPage() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/orders/${id}`);
        const json = await res.json();

        if (json.success) {
          setData(json.order);
        }
      } catch (err) {
        console.error("Receipt load error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="loader">
        Loading receipt...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="loader">
        Receipt not found
      </div>
    );
  }

  return (
    <div className="page">

      {/* PRINT BUTTON */}
      <button className="printBtn no-print" onClick={handlePrint}>
        Print Receipt
      </button>

      {/* RECEIPT */}
      <div className="receipt" id="receipt">

        {/* ================= HEADER ================= */}
        <div className="header">
          <img src="/logo.png" className="logo" />

          <div className="meta">
            <h2>PAYMENT RECEIPT</h2>
            <p><b>Order ID:</b> {data.orderId}</p>
            <p><b>Status:</b> {data.status}</p>
            <p>
              <b>Date:</b>{" "}
              {new Date(data.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <hr />

        {/* ================= CUSTOMER + PAYMENT ================= */}
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
                "N/A"}
            </p>

            <p>
              <b>Receipt No:</b>{" "}
              {data.receipt?.receiptNumber || "Not Generated"}
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
            {data.items?.map((i, idx) => (
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

        {/* FOOTER */}
        <div className="footer">
          Thank you for your purchase ❤️
        </div>

      </div>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .page {
          display: flex;
          justify-content: center;
          padding: 20px;
          background: #f5f5f5;
          min-height: 100vh;
        }

        .loader {
          padding: 30px;
          text-align: center;
        }

        .receipt {
          width: 800px;
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          width: 120px;
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
          border-bottom: 1px solid #eee;
          padding: 8px;
          text-align: left;
        }

        .total {
          text-align: right;
          margin-top: 15px;
          font-size: 18px;
        }

        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 13px;
          color: gray;
        }

        .printBtn {
          margin-bottom: 15px;
          padding: 10px 20px;
          background: black;
          color: white;
          border: none;
          cursor: pointer;
        }

        /* ================= PRINT FIX (CRITICAL) ================= */
        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .page {
            padding: 0 !important;
            background: white !important;
          }

          .receipt {
            box-shadow: none !important;
            width: 100% !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
