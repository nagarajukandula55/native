"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function InvoicePage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const json = await res.json();

        if (json.success) {
          setOrder(json.order);
        }

        const cRes = await fetch(`/api/company`);
        const cJson = await cRes.json();

        if (cJson.success) {
          setCompany(cJson.data);
        }

      } catch (err) {
        console.error(err);
      }
    };

    if (id) load();
  }, [id]);

  if (!order || !company) return <div style={{ padding: 20 }}>Loading Invoice...</div>;

  /* ================= TAX LOGIC ================= */
  const isSameState =
    company.state === order.address?.state;

  let subtotal = 0;
  let totalGST = 0;

  const items = order.items.map((i) => {
    const price = i.price;
    const qty = i.qty;

    const gstRate = i.gst || 18; // default fallback
    const base = (price * qty) / (1 + gstRate / 100);

    const gstAmount = price * qty - base;

    subtotal += base;
    totalGST += gstAmount;

    return {
      ...i,
      base,
      gstRate,
      gstAmount,
      total: price * qty,
    };
  });

  const cgst = isSameState ? totalGST / 2 : 0;
  const sgst = isSameState ? totalGST / 2 : 0;
  const igst = !isSameState ? totalGST : 0;

  const total = order.amount;

  const paymentMode =
    order.payment?.method ||
    (order.payment?.razorpay_payment_id ? "ONLINE" : "MANUAL");

  /* ================= UI ================= */
  return (
    <div className="page">

      <div className="invoice">

        {/* ================= HEADER ================= */}
        <div className="header">

          <div className="left">
            <img src={company.logoUrl} className="logo" />
            <h2>{company.companyName}</h2>
            <p className="tag">{company.brandTagline}</p>

            <p>{company.addressLine1}</p>
            <p>{company.addressLine2}</p>
            <p>{company.city} - {company.pincode}</p>

            <p>GSTIN: {company.gstin}</p>
          </div>

          <div className="right">
            <h1>TAX INVOICE</h1>

            <p><b>Invoice No:</b> {order.invoice?.invoiceNumber}</p>
            <p><b>Date:</b> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><b>Order ID:</b> {order.orderId}</p>
          </div>

        </div>

        {/* ================= CUSTOMER ================= */}
        <div className="section">
          <h4>Bill To</h4>

          <p><b>{order.address?.name}</b></p>
          <p>{order.address?.address}</p>
          <p>{order.address?.city} - {order.address?.pincode}</p>
          <p>{order.address?.state}</p>

          {order.address?.gstNumber && (
            <p>GSTIN: {order.address.gstNumber}</p>
          )}
        </div>

        {/* ================= ITEMS ================= */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Taxable</th>
              <th>GST %</th>
              <th>GST</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {items.map((i, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{i.name}</td>
                <td>{i.qty}</td>
                <td>₹{i.price}</td>
                <td>₹{i.base.toFixed(2)}</td>
                <td>{i.gstRate}%</td>
                <td>₹{i.gstAmount.toFixed(2)}</td>
                <td>₹{i.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= SUMMARY ================= */}
        <div className="summary">

          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>

          {cgst > 0 && <p>CGST: ₹{cgst.toFixed(2)}</p>}
          {sgst > 0 && <p>SGST: ₹{sgst.toFixed(2)}</p>}
          {igst > 0 && <p>IGST: ₹{igst.toFixed(2)}</p>}

          <h3>Total: ₹{total}</h3>

        </div>

        {/* ================= PAYMENT ================= */}
        <div className="section">
          <h4>Payment Details</h4>

          <p><b>Mode:</b> {paymentMode}</p>
          <p><b>Reference:</b> {order.payment?.razorpay_payment_id || order.payment?.utr}</p>
          <p><b>Paid On:</b> {new Date(order.payment?.paidAt).toLocaleString()}</p>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="footer">

          <div className="bank">
            <p><b>Bank:</b> {company.bankName}</p>
            <p><b>A/C:</b> {company.accountNumber}</p>
            <p><b>IFSC:</b> {company.ifsc}</p>
          </div>

          <div className="sign">
            <img src={company.signatureUrl} className="signImg" />
            <img src={company.stampUrl} className="stamp" />
            <p>Authorized Signatory</p>
          </div>

        </div>

      </div>

      {/* ================= STYLE ================= */}
      <style jsx>{`
        .page {
          background: #f5f5f5;
          padding: 30px;
          display: flex;
          justify-content: center;
        }

        .invoice {
          width: 900px;
          background: white;
          padding: 30px;
          font-family: Arial;
        }

        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #ddd;
          padding-bottom: 15px;
        }

        .logo {
          width: 120px;
        }

        .tag {
          font-size: 12px;
          color: gray;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        th, td {
          border-bottom: 1px solid #eee;
          padding: 8px;
          font-size: 13px;
        }

        .summary {
          text-align: right;
          margin-top: 20px;
        }

        .footer {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
        }

        .signImg {
          width: 120px;
        }

        .stamp {
          width: 100px;
          opacity: 0.8;
        }

      `}</style>
    </div>
  );
}
