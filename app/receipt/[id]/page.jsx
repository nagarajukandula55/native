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

  /* ================= PRINT (FIXED - NO WEBSITE LEAK) ================= */
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
              color: #111;
            }

            .invoice {
              max-width: 800px;
              margin: auto;
              border: 1px solid #eee;
              padding: 20px;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #eee;
              padding-bottom: 15px;
            }

            .logo {
              width: 140px;
            }

            .meta h2 {
              margin: 0;
            }

            .row {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
            }

            .box {
              width: 48%;
            }

            h4 {
              margin-bottom: 8px;
              font-size: 14px;
              color: #333;
            }

            p {
              margin: 4px 0;
              font-size: 13px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th {
              text-align: left;
              background: #f5f5f5;
              padding: 10px;
              font-size: 13px;
            }

            td {
              padding: 10px;
              border-bottom: 1px solid #eee;
              font-size: 13px;
            }

            .total {
              text-align: right;
              font-size: 18px;
              font-weight: bold;
              margin-top: 20px;
            }

            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: gray;
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

  /* ================= LOADING ================= */
  if (loading) return <div className="loader">Loading receipt...</div>;
  if (!data) return <div className="loader">Receipt not found</div>;

  return (
    <div className="page">

      {/* PRINT BUTTON */}
      <button className="printBtn no-print" onClick={handlePrint}>
        Print Receipt
      </button>

      {/* ================= RECEIPT ================= */}
      <div id="invoice" className="invoice">

        {/* HEADER */}
        <div className="header">
          <img src="/logo.png" className="logo" />

          <div className="meta">
            <h2>PAYMENT RECEIPT</h2>
            <p><b>Order ID:</b> {data.orderId}</p>
            <p><b>Status:</b> {data.status}</p>
            <p><b>Date:</b> {new Date(data.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* CUSTOMER + PAYMENT */}
        <div className="row">

          <div className="box">
            <h4>Customer Details</h4>
            <p>{data.address?.name}</p>
            <p>{data.address?.phone}</p>
            <p>{data.address?.address}</p>
          </div>

          <div className="box">
            <h4>Payment Details</h4>
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

      {/* ================= PAGE STYLES ================= */}
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

        .invoice {
          width: 800px;
          background: white;
          padding: 20px;
          border: 1px solid #eee;
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
          text-align: left;
        }

        .total {
          text-align: right;
          font-size: 18px;
          font-weight: bold;
          margin-top: 20px;
        }

        .footer {
          text-align: center;
          margin-top: 30px;
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

        .no-print {
          display: block;
        }
      `}</style>

    </div>
  );
}
