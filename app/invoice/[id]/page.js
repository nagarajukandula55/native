"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function InvoicePage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/orders/${id}`);
      const json = await res.json();

      if (json.success) {
        setOrder(json.order);

        const cs = await fetch(`/api/company`);
        const csJson = await cs.json();
        if (csJson.success) setCompany(csJson.data);
      }
    };

    if (id) load();
  }, [id]);

  if (!order || !company) return <div>Loading invoice...</div>;

  /* ================= CALCULATIONS ================= */
  const subtotal =
    order.items?.reduce((a, b) => a + b.price * b.qty, 0) || 0;

  const discount = order.billing?.discount || 0;

  const taxableAmount = subtotal - discount;

  const totalCGST = order.billing?.totalCGST || 0;
  const totalSGST = order.billing?.totalSGST || 0;
  const totalIGST = order.billing?.totalIGST || 0;

  const total = order.amount;

  const totalQty =
    order.items?.reduce((a, b) => a + b.qty, 0) || 0;

  return (
    <div className="page">

      <div id="invoice" className="invoice">

        {/* ================= HEADER ================= */}
        <div className="header">

          <div className="company">
            <h2>{company.companyName}</h2>
            <p className="tag">{company.brandTagline}</p>

            <p>{company.addressLine1}</p>
            <p>{company.addressLine2}</p>
            <p>{company.city} - {company.pincode}</p>
            <p>GSTIN: {company.gstin}</p>
          </div>

          <div className="invoiceMeta">
            <h1>TAX INVOICE</h1>
            <p><b>Invoice No:</b> {order.invoice?.invoiceNumber}</p>
            <p><b>Date:</b> {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

        </div>

        {/* ================= BILL + SHIP ================= */}
        <div className="row">

          <div className="box">
            <h4>Bill To</h4>
            <p>{order.address?.name}</p>
            <p>{order.address?.phone}</p>
            <p>{order.address?.address}</p>
            <p>{order.address?.city}</p>
            {order.address?.gstNumber && (
              <p>GST: {order.address.gstNumber}</p>
            )}
          </div>

          <div className="box">
            <h4>Ship To</h4>
            <p>{order.address?.name}</p>
            <p>{order.address?.phone}</p>
            <p>{order.address?.address}</p>
            <p>{order.address?.city}</p>
          </div>

        </div>

        {/* ================= ITEMS ================= */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item (SKU)</th>
              <th>HSN</th>
              <th>Qty</th>
              <th>Price</th>
              <th>GST %</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((i, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{i.name} ({i.sku})</td>
                <td>{i.hsn || "-"}</td>
                <td>{i.qty}</td>
                <td>₹{i.price}</td>
                <td>{i.gstRate}%</td>
                <td>₹{i.total || i.price * i.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= SUMMARY ================= */}
        <div className="summary">

          <div className="left">
            <p>Total Items: {order.items.length}</p>
            <p>Total Qty: {totalQty}</p>
          </div>

          <div className="right">
            <p>Subtotal: ₹{subtotal}</p>

            {discount > 0 && (
              <p className="discount">Discount: -₹{discount}</p>
            )}

            <p>Taxable: ₹{taxableAmount}</p>

            <p>CGST: ₹{totalCGST}</p>
            <p>SGST: ₹{totalSGST}</p>
            {totalIGST > 0 && <p>IGST: ₹{totalIGST}</p>}

            <h3>Total Payable: ₹{total}</h3>
          </div>

        </div>

        {/* ================= SIGNATURE ================= */}
        <div className="signatureSection">

          <div className="signBox">
            <img src={company.signatureUrl || "/signature.png"} className="sign" />
            <p>Authorised Signatory</p>

            {/* LOGO SHIFTED HERE */}
            <img src={company.logoUrl || "/logo.png"} className="logoBottom" />
          </div>

        </div>

      </div>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .page {
          display: flex;
          justify-content: center;
          padding: 30px;
          background: #f4f6f8;
        }

        .invoice {
          width: 900px;
          background: white;
          padding: 30px;
          border-radius: 10px;
          border: 1px solid #ddd;
        }

        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #eee;
          padding-bottom: 15px;
        }

        .company h2 {
          margin: 0;
        }

        .tag {
          font-size: 13px;
          color: gray;
        }

        .invoiceMeta {
          text-align: right;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }

        .box {
          width: 48%;
          background: #fafafa;
          padding: 12px;
          border-radius: 6px;
        }

        table {
          width: 100%;
          margin-top: 20px;
          border-collapse: collapse;
        }

        th {
          background: #111;
          color: white;
          padding: 10px;
          font-size: 13px;
        }

        td {
          padding: 10px;
          border-bottom: 1px solid #eee;
        }

        .summary {
          display: flex;
          justify-content: space-between;
          margin-top: 25px;
        }

        .right {
          text-align: right;
        }

        .discount {
          color: green;
        }

        .signatureSection {
          margin-top: 40px;
          display: flex;
          justify-content: flex-end;
        }

        .signBox {
          text-align: center;
        }

        .sign {
          width: 120px;
          margin-bottom: 5px;
        }

        .logoBottom {
          width: 70px;
          margin-top: 10px;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
