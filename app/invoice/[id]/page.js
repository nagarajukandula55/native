"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "react-qr-code";

export default function InvoicePage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const load = async () => {
      const o = await fetch(`/api/orders/${id}`).then(r => r.json());
      const c = await fetch(`/api/company`).then(r => r.json());

      if (o.success) setOrder(o.order);
      if (c.success) setCompany(c.data);
    };

    if (id) load();
  }, [id]);

  if (!order || !company) return <div>Loading...</div>;

  const billing = order.billing;
  const gst = order.gstDetails;

  const verifyUrl = `${window.location.origin}/verify/${order.orderId}`;

  return (
    <div className="page">

      {/* ACTION */}
      <div className="topbar no-print">
        <button onClick={() => window.open(`/api/invoice/${id}`)}>
          ⬇ Download PDF
        </button>
      </div>

      <div className="invoice">

        {/* WATERMARK */}
        <div className="watermark">
          {company.companyName}
        </div>

        {/* HEADER */}
        <div className="header">
          <div>
            <h2>{company.companyName}</h2>
            <p className="tag">{company.brandTagline}</p>

            <p>{company.addressLine1}</p>
            <p>{company.city} - {company.pincode}</p>

            <p>GSTIN: {company.gstin}</p>
          </div>

          <div className="right">
            <h1>TAX INVOICE</h1>
            <p>Invoice: {order.invoice?.invoiceNumber}</p>
            <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* BILL / SHIP */}
        <div className="addr">
          <div>
            <h4>Bill To</h4>
            <p>{order.address?.name}</p>
            <p>{order.address?.address}</p>
            <p>{order.address?.city} - {order.address?.pincode}</p>
            {order.address?.gstNumber && (
              <p>GST: {order.address.gstNumber}</p>
            )}
          </div>

          <div>
            <h4>Ship To</h4>
            <p>{order.address?.name}</p>
            <p>{order.address?.address}</p>
            <p>{order.address?.city} - {order.address?.pincode}</p>
          </div>
        </div>

        {/* ITEMS */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>HSN</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Disc</th>
              <th>Taxable</th>
              <th>GST%</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((i, idx) => (
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
          <div>
            <p>Total Items: {billing.itemCount}</p>
          </div>

          <div>
            <p>Subtotal: ₹{billing.subtotal}</p>
            <p>Discount: ₹{billing.discount}</p>
            <p>Taxable: ₹{billing.taxableAmount}</p>

            {!gst.isInterState ? (
              <>
                <p>CGST: ₹{billing.cgst}</p>
                <p>SGST: ₹{billing.sgst}</p>
              </>
            ) : (
              <p>IGST: ₹{billing.igst}</p>
            )}

            <h2>Total: ₹{billing.total}</h2>
          </div>
        </div>

        {/* FOOTER */}
        <div className="footer">

          <div className="qr">
            <QRCode value={verifyUrl} size={90} />
            <p>Scan to Verify</p>
          </div>

          <div className="signBox">
            <img src={company.signatureUrl} />
            <p>Authorised Signatory</p>
          </div>

        </div>

      </div>

      {/* STYLE */}
      <style jsx>{`
        .page { background:#f5f5f5; padding:20px; }

        .invoice {
          background:white;
          padding:25px;
          max-width:900px;
          margin:auto;
          position:relative;
        }

        .watermark {
          position:absolute;
          top:40%;
          left:50%;
          transform:translate(-50%, -50%);
          font-size:80px;
          opacity:0.05;
          font-weight:bold;
        }

        .header {
          display:flex;
          justify-content:space-between;
          border-bottom:2px solid #000;
        }

        .tag { color:gray; }

        .addr {
          display:flex;
          justify-content:space-between;
          margin-top:20px;
        }

        table {
          width:100%;
          border-collapse:collapse;
          margin-top:20px;
        }

        th, td {
          border:1px solid #ddd;
          padding:8px;
          font-size:13px;
        }

        th {
          background:black;
          color:white;
        }

        .summary {
          display:flex;
          justify-content:space-between;
          margin-top:20px;
        }

        .footer {
          display:flex;
          justify-content:space-between;
          margin-top:40px;
        }

        .signBox img {
          height:60px;
        }

        .qr {
          text-align:center;
        }

        @media print {
          .no-print { display:none; }
        }
      `}</style>
    </div>
  );
}
