"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

  if (!order || !company) return <div className="loader">Loading...</div>;

  /* ================= CALCULATIONS ================= */

  const isSameState = company.state === order.address?.state;

  let subtotal = 0;
  let totalGST = 0;
  let totalItems = 0;

  const items = order.items.map((i) => {
    const qty = i.qty;
    const rate = i.price;

    const gstRate = i.gst || 18;
    const total = qty * rate;

    const base = total / (1 + gstRate / 100);
    const gstAmount = total - base;

    subtotal += base;
    totalGST += gstAmount;
    totalItems += qty;

    return {
      ...i,
      gstRate,
      base,
      gstAmount,
      total,
    };
  });

  const discount = order.discount || 0;
  const net = subtotal - discount;

  const cgst = isSameState ? totalGST / 2 : 0;
  const sgst = isSameState ? totalGST / 2 : 0;
  const igst = !isSameState ? totalGST : 0;

  const grandTotal = order.amount;

  const paidDate = order.payment?.paidAt
    ? new Date(order.payment.paidAt).toLocaleString()
    : "N/A";

  /* ================= UI ================= */

  return (
    <div className="page">

      <div className="invoice">

        {/* HEADER */}
        <div className="header">

          <div>
            <img src={company.logoUrl} className="logo" />
            <h2>{company.companyName}</h2>
            <p className="tag">{company.brandTagline}</p>

            <p>{company.addressLine1}</p>
            <p>{company.addressLine2}</p>
            <p>{company.city} - {company.pincode}</p>

            <p><b>GSTIN:</b> {company.gstin}</p>
          </div>

          <div className="invoiceMeta">
            <h1>TAX INVOICE</h1>

            <p><b>Invoice No:</b> {order.invoice?.invoiceNumber}</p>
            <p><b>Date:</b> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><b>Order ID:</b> {order.orderId}</p>
          </div>

        </div>

        {/* CUSTOMER */}
        <div className="section">
          <h4>Bill To</h4>

          <p><b>{order.address?.name}</b></p>
          <p>{order.address?.address}</p>
          <p>{order.address?.city} - {order.address?.pincode}</p>
          <p>{order.address?.state}</p>

          {order.address?.gstNumber && (
            <p><b>GSTIN:</b> {order.address.gstNumber}</p>
          )}
        </div>

        {/* ITEMS */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item (SKU)</th>
              <th>HSN</th>
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
                <td>
                  {i.name}
                  {i.sku && <div className="sku">SKU: {i.sku}</div>}
                </td>
                <td>{i.hsn || "-"}</td>
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

        {/* SUMMARY */}
        <div className="summary">

          <p>Total Items: {totalItems}</p>

          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>

          {discount > 0 && (
            <p>Discount: -₹{discount}</p>
          )}

          <p>Net Amount: ₹{net.toFixed(2)}</p>

          {cgst > 0 && <p>CGST: ₹{cgst.toFixed(2)}</p>}
          {sgst > 0 && <p>SGST: ₹{sgst.toFixed(2)}</p>}
          {igst > 0 && <p>IGST: ₹{igst.toFixed(2)}</p>}

          <h2>Total Payable: ₹{grandTotal}</h2>

        </div>

        {/* PAYMENT */}
        <div className="section">
          <h4>Payment Details</h4>

          <p><b>Mode:</b> {order.payment?.method || "ONLINE"}</p>
          <p><b>Reference:</b> {order.payment?.razorpay_payment_id || order.payment?.utr}</p>
          <p><b>Paid On:</b> {paidDate}</p>
        </div>

        {/* FOOTER */}
        <div className="footer">

          <div>
            <p><b>Bank:</b> {company.bankName}</p>
            <p><b>A/C:</b> {company.accountNumber}</p>
            <p><b>IFSC:</b> {company.ifsc}</p>
          </div>

          <div className="signature">
            <img src="/signature.png" className="sign" />
            <p>Authorized Signatory</p>
          </div>

        </div>

      </div>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .page {
          background: #f0f2f5;
          padding: 30px;
          display: flex;
          justify-content: center;
        }

        .invoice {
          width: 950px;
          background: white;
          padding: 30px;
          border-radius: 10px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #222;
          padding-bottom: 15px;
        }

        .logo {
          width: 120px;
          margin-bottom: 10px;
        }

        .tag {
          color: #666;
          font-size: 12px;
        }

        .invoiceMeta {
          text-align: right;
        }

        table {
          width: 100%;
          margin-top: 20px;
          border-collapse: collapse;
        }

        th {
          background: #222;
          color: white;
          padding: 10px;
        }

        td {
          padding: 10px;
          border-bottom: 1px solid #eee;
        }

        .sku {
          font-size: 11px;
          color: gray;
        }

        .summary {
          text-align: right;
          margin-top: 20px;
        }

        .summary h2 {
          color: #000;
        }

        .footer {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
        }

        .sign {
          width: 120px;
        }

      `}</style>

    </div>
  );
}
