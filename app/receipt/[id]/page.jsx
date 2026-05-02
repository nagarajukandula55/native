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

  /* ================= PRINT (SAFE POPUP) ================= */
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
              padding: 25px;
            }

            /* ================= HEADER ================= */
            .header {
              text-align: center;
              border-bottom: 1px solid #eee;
              padding-bottom: 15px;
            }

            .logo {
              width: 140px;
              margin-bottom: 10px;
            }

            .title {
              font-size: 20px;
              font-weight: bold;
              margin: 5px 0;
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
              margin-bottom: 8px;
              font-size: 14px;
              border-bottom: 1px solid #eee;
              padding-bottom: 4px;
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
              text-align: left;
              padding: 10px;
              font-size: 13px;
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
              font-size: 14px;
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

  const discount = data.discount || 0;
  const subtotal =
    data.items?.reduce((a, b) => a + b.price * b.qty, 0) || 0;
  const total = data.amount;

  return (
    <div className="page">

      {/* PRINT BUTTON */}
      <button className="printBtn no-print" onClick={handlePrint}>
        🖨 Print Receipt
      </button>

      {/* ================= RECEIPT ================= */}
      <div id="invoice" className="invoice">

        {/* HEADER */}
        <div className="header">
          <img src="/logo.png" className="logo" />

          <div className="title">PAYMENT RECEIPT</div>
          <div className="sub">
            Order ID: {data.orderId} | Date:{" "}
            {new Date(data.createdAt).toLocaleString()}
          </div>
        </div>

        {/* CUSTOMER + PAYMENT */}
        <div className="row">

          <div className="box">
            <h4>Customer Details</h4>
            <p><b>Name:</b> {data.address?.name}</p>
            <p><b>Phone:</b> {data.address?.phone}</p>
            <p><b>Address:</b> {data.address?.address}</p>
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
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {data.items?.map((i, idx) => (
              <tr key={idx}>
                <td>{i.name}</td>
                <td>{i.qty}</td>
                <td>₹{i.price}</td>
                <td>₹{i.price * i.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SUMMARY */}
        <div className="summary">
          <p>Subtotal: ₹{subtotal}</p>

          {discount > 0 && (
            <p>Discount: -₹{discount}</p>
          )}

          <div className="total">
            TOTAL PAID: ₹{total}
          </div>
        </div>

        {/* FOOTER */}
        <div className="footer">
          Thank you for your purchase ❤️ | Visit Again
        </div>

      </div>

      {/* ================= PAGE STYLE ================= */}
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
          padding: 25px;
          border: 1px solid #eee;
        }

        .printBtn {
          margin-bottom: 15px;
          padding: 10px 20px;
          background: black;
          color: white;
          border: none;
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
          font-size: 14px;
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
