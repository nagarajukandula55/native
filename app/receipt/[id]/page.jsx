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

  const handlePrint = () => {
    const content = document.getElementById("invoice").outerHTML;
    const win = window.open("", "_blank", "width=900,height=650");

    win.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Arial; padding:20px; }
            .invoice { max-width:800px; margin:auto; }
            .header { text-align:center; }
            .logo { width:110px; margin-bottom:10px; }
            .row { display:flex; justify-content:space-between; margin-top:20px; }
            .box { width:48%; }
            table { width:100%; border-collapse:collapse; margin-top:20px; }
            th, td { padding:10px; border-bottom:1px solid #eee; }
            .summary { text-align:right; margin-top:15px; }
            .total { font-size:18px; font-weight:bold; }
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

  /* ================= CALCULATION (FIXED) ================= */
  const subtotal =
    data.items?.reduce((a, b) => a + b.price * b.qty, 0) || 0;

  const discount = data.discount || 0;

  const netAmount = subtotal - discount;

  const total = data.amount;

  const paymentMode =
    data.payment?.method ||
    (data.payment?.razorpay_payment_id ? "ONLINE" : "MANUAL");

  return (
    <div className="page">

      {/* PRINT BUTTON */}
      <button className="printBtn" onClick={handlePrint}>
        🖨 Print Receipt
      </button>

      {/* RECEIPT */}
      <div id="invoice" className="invoice">

        {/* HEADER */}
        <div className="header">
          <img src="/logo.png" className="logo" />
          <div className="title">PAYMENT RECEIPT</div>
        </div>

        {/* ORDER DETAILS */}
        <div className="section">
          <h4>Order Details</h4>
          <p><b>Order ID:</b> {data.orderId}</p>
          <p><b>Status:</b> {data.status}</p>
          <p>
            <b>Date & Time:</b>{" "}
            {new Date(data.createdAt).toLocaleString()}
          </p>
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
            <p><b>Mode:</b> {paymentMode}</p>
            <p>
              <b>Reference:</b>{" "}
              {data.payment?.razorpay_payment_id ||
                data.receipt?.paymentReference ||
                "N/A"}
            </p>
            <p>
              <b>Receipt No:</b>{" "}
              {data.receipt?.receiptNumber || "N/A"}
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

          <p>Net Amount: ₹{netAmount}</p>

          <div className="total">
            Total Paid: ₹{total}
          </div>
        </div>

        {/* FOOTER */}
        <div className="footer">
          Thank you for your purchase ❤️
        </div>

      </div>

      {/* STYLES */}
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

        .logo {
          width: 110px;
          object-fit: contain;
        }

        .header {
          text-align: center;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }

        .title {
          font-size: 20px;
          font-weight: bold;
        }

        .section {
          margin-top: 15px;
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
          text-align: right;
          margin-top: 15px;
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

        .printBtn {
          margin-bottom: 15px;
          padding: 10px 20px;
          background: black;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
