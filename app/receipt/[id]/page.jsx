"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
    window.print();
  };

  /* ================= PDF GENERATE (FIXED) ================= */
  const handlePDF = async () => {
    const element = document.getElementById("invoice");

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true, // 🔥 IMPORTANT for logo
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 295;

    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Receipt-${data.orderId}.pdf`);
  };

  if (loading) return <div className="loader">Loading...</div>;
  if (!data) return <div className="loader">Not found</div>;

  /* ================= CALC ================= */
  const subtotal =
    data.items?.reduce((a, b) => a + b.price * b.qty, 0) || 0;

  const discount = data.discount || 0;
  const net = subtotal - discount;

  return (
    <div className="page">

      <div className="actions">
        <button onClick={handlePrint}>🖨 Print</button>
        <button onClick={handlePDF}>📄 Download PDF</button>
      </div>

      <div id="invoice" className="invoice">

        {/* ================= HEADER ================= */}
        <div className="header">

          <img
            src="https://shopnative.in/logo.png"
            className="logo"
          />

          <div className="tagline">
            Smart Repairs. Trusted Service.
          </div>

          <div className="title">
            PAYMENT RECEIPT
          </div>

        </div>

        {/* ================= ORDER ================= */}
        <div className="section">
          <p><b>Order ID:</b> {data.orderId}</p>
          <p>
            <b>Date:</b>{" "}
            {new Date(data.createdAt).toLocaleString()}
          </p>
        </div>

        {/* ================= DETAILS ================= */}
        <div className="row">

          <div className="box">
            <h4>Customer</h4>
            <p>{data.address?.name}</p>
            <p>{data.address?.phone}</p>
            <p>{data.address?.address}</p>
          </div>

          <div className="box">
            <h4>Payment</h4>
            <p><b>Mode:</b> {data.payment?.method || "ONLINE"}</p>
            <p>
              <b>Ref:</b>{" "}
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

        {/* ================= ITEMS ================= */}
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

        {/* ================= SUMMARY ================= */}
        <div className="summary">

          <p>Subtotal: ₹{subtotal}</p>

          {discount > 0 && (
            <p>Discount: -₹{discount}</p>
          )}

          <p>Net Amount: ₹{net}</p>

          <div className="total">
            Paid: ₹{data.amount}
          </div>

        </div>

        {/* ================= FOOTER ================= */}
        <div className="footer">
          Thank you for your business ❤️
        </div>

      </div>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .page {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f5f5f5;
          padding: 20px;
        }

        .actions {
          margin-bottom: 15px;
        }

        .actions button {
          margin-right: 10px;
          padding: 10px 16px;
          border: none;
          background: black;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }

        .invoice {
          width: 800px;
          background: white;
          padding: 25px;
        }

        .header {
          text-align: center;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }

        .logo {
          width: 120px;
          height: auto;
          margin-bottom: 6px;
        }

        .tagline {
          font-size: 12px;
          color: gray;
          margin-bottom: 6px;
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

        @media print {
          .actions {
            display: none;
          }

          body {
            background: white;
          }

          .invoice {
            box-shadow: none;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
