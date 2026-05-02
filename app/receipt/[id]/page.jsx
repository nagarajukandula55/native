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
        const res = await fetch(`/api/orders/${id}`);
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

    if (id) load();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="loader">Loading receipt...</div>;
  if (!data) return <div className="loader">Receipt not found</div>;

  return (
    <div className="page">

      {/* PRINT BUTTON */}
      <button className="printBtn no-print" onClick={handlePrint}>
        Print Receipt
      </button>

      {/* ======== INVOICE CONTAINER (ONLY PRINT AREA) ======== */}
      <div id="invoice" className="invoice">

        {/* HEADER */}
        <div className="header">
          <img src="/logo.png" className="logo" />

          <div className="meta">
            <h2>PAYMENT RECEIPT</h2>
            <p><b>Order:</b> {data.orderId}</p>
            <p><b>Status:</b> {data.status}</p>
            <p>
              <b>Date:</b>{" "}
              {new Date(data.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="divider" />

        {/* CUSTOMER + PAYMENT */}
        <div className="row">

          <div>
            <h4>Customer</h4>
            <p>{data.address?.name}</p>
            <p>{data.address?.phone}</p>
            <p>{data.address?.address}</p>
          </div>

          <div>
            <h4>Payment</h4>
            <p><b>Method:</b> {data.payment?.method || "ONLINE"}</p>
            <p>
              <b>Reference:</b>{" "}
              {data.payment?.razorpay_payment_id ||
                data.receipt?.paymentReference ||
                "N/A"}
            </p>
            <p>
              <b>Receipt No:</b>{" "}
              {data.receipt?.receiptNumber || "Not Generated"}
            </p>
          </div>

        </div>

        <div className="divider" />

        {/* ITEMS */}
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

        {/* TOTAL */}
        <div className="total">
          TOTAL PAID: ₹{data.amount}
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

        /* ================= INVOICE CARD ================= */
        .invoice {
          width: 210mm;
          min-height: 297mm;
          background: white;
          padding: 25px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          width: 140px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin: 15px 0;
        }

        .divider {
          border-top: 1px solid #ddd;
          margin: 15px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          border-bottom: 1px solid #eee;
          padding: 8px;
        }

        .total {
          text-align: right;
          font-size: 18px;
          margin-top: 20px;
          font-weight: bold;
        }

        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 12px;
          color: gray;
        }

        .printBtn {
          margin-bottom: 15px;
          padding: 10px 20px;
          background: black;
          color: white;
          border: none;
        }

        /* ================= PRINT FIX (CRITICAL) ================= */
        @media print {
          body * {
            visibility: hidden;
          }

          #invoice, #invoice * {
            visibility: visible;
          }

          #invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
          }

          .no-print {
            display: none !important;
          }

          .page {
            background: white !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
