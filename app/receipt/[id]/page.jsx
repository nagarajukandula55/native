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

        if (json.success) setData(json.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  /* ================= PRINT ================= */
  const handlePrint = () => {
    const content = document.getElementById("invoice").outerHTML;

    const win = window.open("", "_blank", "width=900,height=650");

    win.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }

            .invoice {
              max-width: 800px;
              margin: auto;
              border: 1px solid #eee;
              padding: 25px;
            }

            .logo-box {
              width: 140px;
              height: 80px;
              margin: 0 auto;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .logo-box img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }

            .header {
              text-align: center;
              border-bottom: 1px solid #eee;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }

            .title {
              font-size: 20px;
              font-weight: bold;
            }

            .row {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
            }

            .box {
              width: 48%;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              padding: 10px;
              border-bottom: 1px solid #eee;
            }

            .summary {
              margin-top: 20px;
              width: 300px;
              margin-left: auto;
              font-size: 14px;
            }

            .summary div {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
            }

            .total {
              font-weight: bold;
              font-size: 18px;
              border-top: 1px solid #ddd;
              padding-top: 8px;
              margin-top: 10px;
            }
          </style>
        </head>

        <body onload="window.print(); window.close();">
          ${content}
        </body>
      </html>
    `);

    win.document.close();
  };

  if (loading) return <div className="loader">Loading...</div>;
  if (!data) return <div className="loader">Not found</div>;

  const subtotal =
    data.items?.reduce((a, b) => a + b.price * b.qty, 0) || 0;

  const discount = data.discount || 0;
  const total = data.amount;

  return (
    <div className="page">

      {/* PRINT BUTTON */}
      <button className="printBtn" onClick={handlePrint}>
        🧾 Print Receipt
      </button>

      {/* ================= RECEIPT ================= */}
      <div id="invoice" className="invoice">

        {/* HEADER */}
        <div className="header">

          {/* 🔥 FIXED LOGO BOX */}
          <div className="logo-box">
            <img src="/logo.png" alt="logo" />
          </div>

          <div className="title">PAYMENT RECEIPT</div>
          <div className="sub">
            {data.orderId} | {new Date(data.createdAt).toLocaleString()}
          </div>
        </div>

        {/* CUSTOMER + PAYMENT */}
        <div className="row">

          <div className="box">
            <h4>Customer</h4>
            <p>{data.address?.name}</p>
            <p>{data.address?.phone}</p>
            <p>{data.address?.address}</p>
          </div>

          <div className="box">
            <h4>Payment</h4>
            <p>Method: {data.payment?.method || "ONLINE"}</p>
            <p>
              Ref:{" "}
              {data.payment?.razorpay_payment_id ||
                data.receipt?.paymentReference ||
                "N/A"}
            </p>
            <p>
              Receipt: {data.receipt?.receiptNumber || "N/A"}
            </p>
          </div>

        </div>

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

        {/* 🔥 PROPER PAYMENT BREAKDOWN */}
        <div className="summary">

          <div>
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          {discount > 0 && (
            <div>
              <span>Discount</span>
              <span>- ₹{discount}</span>
            </div>
          )}

          <div className="total">
            <span>Total Paid</span>
            <span>₹{total}</span>
          </div>

        </div>

      </div>

      {/* ================= UI STYLES ================= */}
      <style jsx>{`
        .page {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: #f5f5f5;
        }

        .invoice {
          width: 800px;
          background: white;
          padding: 25px;
          border: 1px solid #eee;
        }

        /* 🔥 STRICT LOGO FIX */
        .logo-box {
          width: 140px;
          height: 80px;
          margin: 0 auto 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-box img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .printBtn {
          margin-bottom: 15px;
          padding: 12px 20px;
          background: black;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }

        .box {
          width: 48%;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        th, td {
          padding: 10px;
          border-bottom: 1px solid #eee;
        }

        .summary {
          margin-top: 20px;
          width: 300px;
          margin-left: auto;
        }

        .summary div {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .total {
          font-weight: bold;
          font-size: 18px;
          border-top: 1px solid #ddd;
          padding-top: 8px;
          margin-top: 10px;
        }
      `}</style>

    </div>
  );
}
