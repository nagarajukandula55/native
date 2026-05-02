"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function InvoicePage() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const json = await res.json();

        if (json.success) {
          setData(json.order);
          setCompany(json.order.company || {}); // from DB
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const handlePrint = () => window.print();

  const handlePDF = () => {
    window.open(`/api/invoice/${id}`, "_blank");
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

  return (
    <div className="page">

      {/* ACTIONS */}
      <div className="actions no-print">
        <button onClick={handlePrint}>🖨 Print</button>
        <button onClick={handlePDF}>⬇ Download PDF</button>
      </div>

      {/* ================= INVOICE ================= */}
      <div id="invoice" className="invoice">

        {/* HEADER */}
        <div className="header">
          <div className="left">
            <img src={company?.logo || "/logo.png"} className="logo" />
            <div>
              <div className="company">{company?.name}</div>
              <div className="tag">{company?.tagline}</div>
            </div>
          </div>

          <div className="right">
            <div className="title">TAX INVOICE</div>
            <p>Invoice: {data.invoice?.invoiceNumber}</p>
            <p>Order: {data.orderId}</p>
            <p>
              Date: {new Date(data.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* SELLER + BUYER */}
        <div className="row">
          <div className="box">
            <h4>Seller</h4>
            <p>{company?.name}</p>
            <p>{company?.address}</p>
            <p>GSTIN: {company?.gst}</p>
          </div>

          <div className="box">
            <h4>Bill To</h4>
            <p>{data.address?.name}</p>
            <p>{data.address?.phone}</p>
            <p>{data.address?.address}</p>
            <p>
              {data.address?.city} - {data.address?.pincode}
            </p>
          </div>
        </div>

        {/* ITEMS */}
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
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

          <div className="line">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          {discount > 0 && (
            <div className="line">
              <span>Discount</span>
              <span>- ₹{discount}</span>
            </div>
          )}

          <div className="line">
            <span>Taxable</span>
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
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="payment">
          <h4>Payment Details</h4>
          <p>
            Mode: {data.payment?.method || "ONLINE"}
          </p>
          <p>
            Ref:{" "}
            {data.payment?.razorpay_payment_id ||
              data.receipt?.paymentReference ||
              "NA"}
          </p>
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
        }

        .actions {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .actions button {
          padding: 10px 16px;
          border: none;
          background: black;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }

        .invoice {
          max-width: 900px;
          margin: auto;
          background: white;
          padding: 25px;
        }

        .header {
          display: flex;
          justify-content: space-between;
        }

        .left {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .logo {
          width: 80px;
          object-fit: contain;
        }

        .company {
          font-size: 18px;
          font-weight: bold;
        }

        .tag {
          font-size: 12px;
          color: gray;
        }

        .right {
          text-align: right;
          font-size: 13px;
        }

        .title {
          font-weight: bold;
          font-size: 16px;
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
          margin-top: 20px;
          border-collapse: collapse;
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

        .line {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
        }

        .total {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 16px;
          border-top: 1px solid #ddd;
          margin-top: 10px;
          padding-top: 10px;
        }

        .payment {
          margin-top: 30px;
        }

        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 12px;
          color: gray;
        }

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
          }

          .no-print {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
