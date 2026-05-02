"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function InvoicePage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [o, c] = await Promise.all([
          fetch(`/api/orders/${id}`).then(r => r.json()),
          fetch(`/api/company`).then(r => r.json()),
        ]);

        if (o.success) setOrder(o.order);
        if (c.success) setCompany(c.data);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const downloadPDF = () => {
    window.open(`/api/invoice/${id}`, "_blank");
  };

  if (loading) return <div className="loader">Loading invoice...</div>;
  if (!order || !company) return <div className="loader">Invoice not found</div>;

  const items = order.items || [];
  const billing = order.billing || {};
  const gst = order.gstDetails || {};

  return (
    <div className="page">

      <div className="topbar no-print">
        <button onClick={downloadPDF}>⬇ Download PDF</button>
      </div>

      <div id="invoice" className="invoice">

        {/* HEADER */}
        <div className="header">

          <div className="left">
            <h2>{company.companyName}</h2>
            <p>{company.brandTagline}</p>

            <p>{company.addressLine1}</p>
            <p>{company.city} - {company.pincode}</p>

            <p>GSTIN: {company.gstin}</p>
            <p>State Code: {company.stateCode}</p>
          </div>

          <div className="right">
            <h1>TAX INVOICE</h1>
            <p><b>Invoice No:</b> {order.invoice?.invoiceNumber}</p>
            <p><b>Order ID:</b> {order.orderId}</p>
            <p><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</p>
          </div>

        </div>

        {/* BILL / SHIP */}
        <div className="addressRow">

          <div>
            <h4>Bill To</h4>
            <p>{order.address?.name}</p>
            <p>{order.address?.phone}</p>
            <p>{order.address?.address}</p>
            <p>{order.address?.city} - {order.address?.pincode}</p>
            {order.address?.gstNumber && (
              <p>GST: {order.address.gstNumber}</p>
            )}
          </div>

          <div>
            <h4>Ship To</h4>
            <p>{order.address?.name}</p>
            <p>{order.address?.phone}</p>
            <p>{order.address?.address}</p>
            <p>{order.address?.city} - {order.address?.pincode}</p>
          </div>

        </div>

        {/* TABLE */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>HSN</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Taxable</th>
              <th>GST %</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {items.map((i, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>
                  {i.name}
                  <br />
                  <small>{i.sku}</small>
                </td>
                <td>{i.hsn}</td>
                <td>{i.qty}</td>
                <td>₹{i.price}</td>
                <td>₹{i.discountAllocated}</td>
                <td>₹{i.taxableAmount}</td>
                <td>{i.gstPercent}%</td>
                <td>₹{i.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SUMMARY */}
        <div className="summary">

          <div className="left">
            <p><b>Total Items:</b> {billing.itemCount}</p>
            <p><b>Payment Mode:</b> {order.payment?.method || "ONLINE"}</p>
          </div>

          <div className="right">
            <p>Subtotal: ₹{billing.subtotal}</p>
            <p>Discount: -₹{billing.discount}</p>
            <p>Taxable: ₹{billing.taxableAmount}</p>

            {!gst.isInterState ? (
              <>
                <p>CGST: ₹{billing.cgst}</p>
                <p>SGST: ₹{billing.sgst}</p>
              </>
            ) : (
              <p>IGST: ₹{billing.igst}</p>
            )}

            <h3>Total: ₹{billing.total}</h3>
          </div>

        </div>

        {/* SIGNATURE */}
        <div className="footer">
          <div>
            <img src={company.signatureUrl} className="sign" />
            <p>Authorised Signatory</p>
          </div>
        </div>

      </div>

      {/* STYLE */}
      <style jsx>{`
        .page {
          background: #f5f5f5;
          padding: 20px;
        }

        .invoice {
          max-width: 900px;
          margin: auto;
          background: white;
          padding: 25px;
          border: 1px solid #ddd;
        }

        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }

        .addressRow {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          font-size: 13px;
        }

        th {
          background: #000;
          color: #fff;
        }

        .summary {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }

        .footer {
          margin-top: 40px;
          text-align: right;
        }

        .sign {
          height: 60px;
        }

        .topbar {
          text-align: center;
          margin-bottom: 10px;
        }

        button {
          padding: 10px 20px;
          background: black;
          color: white;
          border: none;
        }

        @media print {
          .no-print {
            display: none;
          }
        }
      `}</style>

    </div>
  );
}
