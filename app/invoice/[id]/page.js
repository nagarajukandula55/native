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
        <button onClick={downloadPDF}>
          📄 Download Invoice
        </button>
      </div>

      {/* ================= INVOICE ================= */}
      <div className="invoice">

        {/* HEADER */}
        <div className="header">

          <div className="brand">
            <img
              src="https://shopnative.in/logo.png"
              className="logo"
            />
            <div className="tagline">
              Your Trusted Mobile & Laptop Store
            </div>
          </div>

          <div className="invoiceMeta">
            <h2>INVOICE</h2>
            <p><b>Invoice No:</b> {data.invoice?.invoiceNumber || "NA"}</p>
            <p><b>Date:</b> {new Date(data.createdAt).toLocaleString()}</p>
          </div>

        </div>

        {/* CUSTOMER + ORDER */}
        <div className="sectionRow">

          <div className="box">
            <h4>Bill To</h4>
            <p>{data.address?.name}</p>
            <p>{data.address?.phone}</p>
            <p>{data.address?.address}</p>
            <p>
              {data.address?.city} - {data.address?.pincode}
            </p>
          </div>

          <div className="box">
            <h4>Order Details</h4>
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
              <th style={{ textAlign: "center" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Price</th>
              <th style={{ textAlign: "right" }}>Total</th>
            </tr>
          </thead>

          <tbody>
            {data.items?.map((i, idx) => (
              <tr key={idx}>
                <td>{i.name}</td>
                <td style={{ textAlign: "center" }}>{i.qty}</td>
                <td style={{ textAlign: "right" }}>₹{i.price}</td>
                <td style={{ textAlign: "right" }}>
                  ₹{i.price * i.qty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SUMMARY */}
        <div className="summary">

          <div className="line">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          {discount > 0 && (
            <div className="line discount">
              <span>Discount</span>
              <span>-₹{discount}</span>
            </div>
          )}

          <div className="line">
            <span>Taxable Amount</span>
            <span>₹{taxable}</span>
          </div>

          {cgst > 0 && (
            <>
              <div className="line">
                <span>CGST</span>
                <span>₹{cgst}</span>
              </div>
              <div className="line">
                <span>SGST</span>
                <span>₹{sgst}</span>
              </div>
            </>
          )}

          {igst > 0 && (
            <div className="line">
              <span>IGST</span>
              <span>₹{igst}</span>
            </div>
          )}

          <div className="total">
            <span>TOTAL</span>
            <span>₹{total}</span>
          </div>

        </div>

        {/* FOOTER */}
        <div className="footer">
          This is a system generated invoice.
        </div>

      </div>

      {/* ================= STYLES ================= */}
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
          width: 800px;
          display: flex;
          justify-content: flex-end;
        }

        .actions button {
          padding: 10px 18px;
          background: #000;
          color: #fff;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
        }

        .invoice {
          width: 800px;
          background: #fff;
          padding: 25px;
          border: 1px solid #eee;
        }

        /* HEADER */
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #eee;
          padding-bottom: 12px;
        }

        .brand {
          display: flex;
          flex-direction: column;
        }

        .logo {
          width: 110px;
          object-fit: contain;
        }

        .tagline {
          font-size: 12px;
          color: #666;
          margin-top: 3px;
        }

        .invoiceMeta {
          text-align: right;
        }

        /* ROW */
        .sectionRow {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }

        .box {
          width: 48%;
        }

        h4 {
          margin-bottom: 6px;
        }

        /* TABLE */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        th {
          background: #f7f7f7;
          padding: 10px;
          font-size: 13px;
        }

        td {
          padding: 10px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }

        /* SUMMARY */
        .summary {
          margin-top: 20px;
          width: 300px;
          margin-left: auto;
        }

        .line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .discount {
          color: green;
        }

        .total {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 16px;
          margin-top: 10px;
          border-top: 1px solid #ddd;
          padding-top: 8px;
        }

        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #888;
        }

        .loader {
          padding: 40px;
        }
      `}</style>

    </div>
  );
}
