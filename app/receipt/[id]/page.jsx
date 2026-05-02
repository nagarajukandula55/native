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
              color: #111;
              background: white;
            }

            .invoice {
              max-width: 800px;
              margin: auto;
              border: 1px solid #eee;
              padding: 25px;
            }

            /* ================= HEADER (FIXED LOGO) ================= */
            .header {
              text-align: center;
              border-bottom: 1px solid #eee;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }

            .logo {
              width: 120px;
              height: 120px;
              object-fit: contain;
              margin: 0 auto 10px auto;
              display: block;
            }

            .title {
              font-size: 20px;
              font-weight: 700;
              margin: 5px 0;
              letter-spacing: 0.5px;
            }

            .sub {
              font-size: 13px;
              color: gray;
            }

            /* ================= ROW ================= */
            .row {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
            }

            .box {
              width: 48%;
            }

            h4 {
              font-size: 14px;
              margin-bottom: 8px;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }

            p {
              margin: 4px 0;
              font-size: 13px;
            }

            /* ================= TABLE ================= */
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th {
              background: #f5f5f5;
              padding: 10px;
              font-size: 13px;
              text-align: left;
            }

            td {
              padding: 10px;
              border-bottom: 1px solid #eee;
              font-size: 13px;
            }

            /* ================= TOTAL ================= */
            .summary {
              margin-top: 15px;
              text-align: right;
            }

            .total {
              font-size: 18px;
              font-weight: bold;
              margin-top: 10px;
            }

            /* ================= FOOTER ================= */
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

  if (loading) return <div className="loader">Loading receipt...</div>;
  if (!data) return <div className="loader">Receipt not found</div>;

  return (
    <div className="page">

      {/* ================= BEAUTIFUL PRINT BUTTON ================= */}
      <button className="printBtn no-print" onClick={handlePrint}>
        🧾 Print Receipt
      </button>

      {/* ================= INVOICE ================= */}
      <div id="invoice" className="invoice">

        {/* HEADER */}
        <div className="header">
          <img src="/logo.png" className="logo" />

          <div className="title">PAYMENT RECEIPT</div>

          <div className="sub">
            Order ID: {data.orderId} <br />
            Date: {new Date(data.createdAt).toLocaleString()}
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
        <div className="summary">
          <div className="total">
            TOTAL PAID: ₹{data.amount}
          </div>
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
          flex-direction: column;
          align-items: center;
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
          padding: 25px;
          border: 1px solid #eee;
        }

        /* ================= PREMIUM PRINT BUTTON ================= */
        .printBtn {
          margin-bottom: 15px;
          padding: 12px 22px;
          background: linear-gradient(135deg, #111, #333);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          transition: 0.2s;
        }

        .printBtn:hover {
          transform: translateY(-2px);
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

        .summary {
          margin-top: 15px;
          text-align: right;
        }

        .total {
          font-size: 18px;
          font-weight: bold;
          margin-top: 10px;
        }

        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: gray;
        }

        .no-print {
          display: block;
        }
      `}</style>

    </div>
  );
}
