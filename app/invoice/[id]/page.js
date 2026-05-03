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

    load();
  }, [id]);

  if (!order || !company) return <div>Loading...</div>;

  const billing = order.billing || {
    itemCount: order.items?.length || 0,
    subtotal: order.items?.reduce((a, b) => a + (b.price * b.qty), 0) || 0,
    discount: order.discount || 0,
    taxableAmount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    total: order.amount || 0,
  };

  billing.taxableAmount =
  billing.subtotal - billing.discount;
  
  const gst = order.gstDetails;

  const verifyUrl = `${window.location.origin}/verify/${order.orderId}`;

  return (
    <div className="page">

      <div className="topbar">
        <button onClick={() => window.open(`/api/invoice/${id}`)}>
          ⬇ Download PDF
        </button>
        <button
          onClick={() => resendEmail(o._id)}
        >
          Resend Email
        </button>
        
        <button
          onClick={() => resendWhatsApp(o._id)}
        >
          Resend WhatsApp
        </button>
      </div>

      <div className="invoice">

        {/* WATERMARK */}
        <div className="watermark">{company.companyName}</div>

        {/* HEADER */}
        <div className="header">
          <div>
            <h2>{company.companyName}</h2>
            <p>{company.brandTagline}</p>
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

        {/* ADDRESS */}
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
              <th>Item</th>
              <th>HSN</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Taxable</th>
              <th>GST%</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((i, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{i.name}</td>
                <td>{i.hsn}</td>
                <td>{i.qty}</td>
                <td>₹{i.price}</td>
                <td>₹{i.discountAllocated || 0}</td>
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

          <div>
            <QRCode value={verifyUrl} size={90} />
            <p>Scan to Verify</p>
          </div>

          <div>
            <img src={company.signatureUrl} className="sign" />
            <p>Authorised Signatory</p>
          </div>

        </div>

      </div>

      <style jsx>{`
        .invoice { background:white; padding:25px; max-width:900px; margin:auto; position:relative; }
        .watermark { position:absolute; top:40%; left:50%; transform:translate(-50%,-50%); font-size:80px; opacity:0.05; }
        .header { display:flex; justify-content:space-between; border-bottom:2px solid #000; }
        .addr { display:flex; justify-content:space-between; margin-top:20px; }
        table { width:100%; border-collapse:collapse; margin-top:20px; }
        th,td { border:1px solid #ddd; padding:8px; font-size:13px; }
        th { background:black; color:white; }
        .summary { display:flex; justify-content:space-between; margin-top:20px; }
        .footer { display:flex; justify-content:space-between; margin-top:40px; }
        .sign { height:60px; }
      `}</style>

    </div>
  );
}
