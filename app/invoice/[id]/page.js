"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function InvoicePage() {
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

  const downloadPDF = () => {
    window.open(`/api/invoice/${data.orderId}`, "_blank");
  };

  if (loading) return <div className="loader">Loading invoice...</div>;
  if (!data) return <div className="loader">Invoice not found</div>;

  /* ================= CALCULATIONS ================= */
  const subtotal =
    data.items?.reduce((a, b) => a + b.price * b.qty, 0) || 0;

  const discount = data.discount || 0;

  const taxable = subtotal - discount;

  const cgst = data.billing?.cgst || 0;
  const sgst = data.billing?.sgst || 0;
  const igst = data.billing?.igst || 0;

  const total = data.amount;

  const paymentMode =
    data.payment?.method ||
    (data.payment?.razorpay_payment_id ? "ONLINE" : "MANUAL");

  return (
    <div className="page">

      {/* ACTION BAR */}
      <div className="actions no-print">
        <button onClick={downloadPDF}>📄 Download PDF</button>
      </div>

      {/* INVOICE */}
      <div className="invoice" id="invoice">

        {/* HEADER */}
        <div className="header">

          <div className="logoWrap">
            <img
              src="https://shopnative.in/logo.png"
              className="logo"
            />
            <div className="tagline">
              Your Trusted Mobile & Laptop Store
            </div>
          </div>

          <div className="titleBlock">
            <h2>INVOICE</h2>
            <p><b>Invoice No:</b> {data.invoice?.invoiceNumber || "NA"}</p>
            <p><b>Date:</b> {new Date(data.createdAt).toLocaleString()}</p>
          </div>

        </div>

        {/* CUSTOMER + ORDER */}
        <div className="row">

          <div className="box">
            <h4>Bill To</h4>
            <p>{data.address?.name}</p>
            <p>{data.address?.phone}</p>
            <p>{data.address?.address}</p>
            <p>{data.address?.city} - {data.address?.pincode}</p>
          </div>

          <div className="box">
            <h4>Order Info</h4>
            <p><b>Order ID:</b> {data.orderId}</p>
            <p><b>Status:</b> {data.status}</p>
            <p><b>Payment:</b> {paymentMode}</p>
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

          <p>Taxable Amount: ₹{taxable}</p>

          {cgst > 0 && (
            <>
              <p>CGST: ₹{cgst}</p>
              <p>SGST: ₹{sgst}</p>
            </>
          )}

          {igst > 0 && (
            <p>IGST: ₹{igst}</p>
          )}

          <div className="total">
            TOTAL: ₹{total}
          </div>

        </div>

        {/* FOOTER */}
        <div className="footer">
          This is a system generated invoice.
        </div>

      </div>

      {/* STYLES */}
      <style jsx>{`
        .page {
          padding: 20px;
          background: #f5f5f5;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .actions {
          margin-bottom: 15px;
        }

        .actions button {
          padding: 10px 20px;
          background: black;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }

        .invoice {
          width: 800px;
          background: white;
          padding: 25px;
          border: 1px solid #eee;
        }

        /* HEADER */
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }

        .logoWrap {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .logo {
          width: 110px;
        }

        .tagline {
          font-size: 12px;
          color: gray;
        }

        .titleBlock {
          text-align: right;
        }

        /* ROW */
        .row {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }

        .box {
          width: 48%;
        }

        h4 {
          margin-bottom: 5px;
        }

        /* TABLE */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        th, td {
          padding: 10px;
          border-bottom: 1px solid #eee;
        }

        /* SUMMARY */
        .summary {
          margin-top: 20px;
          text-align: right;
        }

        .total {
          font-size: 18px;
          font-weight: bold;
          margin-top: 10px;
        }

        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: gray;
        }

        .loader {
          padding: 40px;
        }
      `}</style>

    </div>
  );
}
