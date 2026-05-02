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

  /* ================= DOWNLOAD PDF ================= */
  const downloadPDF = () => {
    window.open(`/api/invoice/${id}`, "_blank");
  };

  return (
    <div className="page">

      {/* ACTIONS */}
      <div className="actions">
        <button onClick={downloadPDF}>⬇ Download PDF</button>
      </div>

      <div id="invoice" className="invoice">

        {/* HEADER */}
        <div className="header">
          <div>
            <h2>{company.companyName}</h2>
            <p className="tag">{company.brandTagline}</p>

            <p>{company.addressLine1}</p>
            <p>{company.addressLine2}</p>
            <p>{company.city} - {company.pincode}</p>
            <p><b>GSTIN:</b> {company.gstin}</p>
          </div>

          <div className="rightHead">
            <h1>TAX INVOICE</h1>
            <p><b>Invoice:</b> {order.invoice?.invoiceNumber}</p>
            <p><b>Date:</b> {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* BILL / SHIP */}
        <div className="row">

          <div className="box">
            <h4>Bill To</h4>
            <p>{order.address?.name}</p>
            <p>{order.address?.phone}</p>
            <p>{order.address?.address}</p>
            <p>
              {order.address?.city} - {order.address?.pincode}
            </p>
            {order.address?.gstNumber && (
              <p>GST: {order.address.gstNumber}</p>
            )}
          </div>

          <div className="box">
            <h4>Ship To</h4>
            <p>{order.address?.name}</p>
            <p>{order.address?.phone}</p>
            <p>{order.address?.address}</p>
            <p>
              {order.address?.city} - {order.address?.pincode}
            </p>
          </div>

        </div>

        {/* ITEMS TABLE */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>HSN</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>GST%</th>
              <th>Amount</th>
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

        {/* SUMMARY */}
        <div className="summary">

          <div className="left">
            <p>Total Items: {order.items.length}</p>
            <p>Total Qty: {totalQty}</p>
          </div>

          <div className="right">

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
              <span>Taxable</span>
              <span>₹{taxableAmount}</span>
            </div>

            <div className="line">
              <span>CGST</span>
              <span>₹{totalCGST}</span>
            </div>

            <div className="line">
              <span>SGST</span>
              <span>₹{totalSGST}</span>
            </div>

            {totalIGST > 0 && (
              <div className="line">
                <span>IGST</span>
                <span>₹{totalIGST}</span>
              </div>
            )}

            <div className="line total">
              <span>Total Payable</span>
              <span>₹{total}</span>
            </div>

          </div>
        </div>

        {/* SIGNATURE */}
        <div className="signature">
          <div>
            <img src={company.signatureUrl || "/signature.png"} className="sign" />
            <p>Authorised Signatory</p>
            <img src={company.logoUrl || "/logo.png"} className="logoBottom" />
          </div>
        </div>

      </div>

      {/* STYLES */}
      <style jsx>{`
        .page {
          padding: 30px;
          background: #f5f5f5;
        }

        .actions {
          text-align: right;
          margin-bottom: 10px;
        }

        button {
          padding: 10px 16px;
          background: black;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }

        .invoice {
          width: 900px;
          margin: auto;
          background: white;
          padding: 30px;
          border: 1px solid #ccc;
        }

        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }

        .row {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .box {
          flex: 1;
          border: 1px solid #ccc;
          padding: 10px;
        }

        table {
          width: 100%;
          margin-top: 20px;
          border-collapse: collapse;
        }

        th, td {
          border: 1px solid #ccc;
          padding: 8px;
        }

        th {
          background: #000;
          color: white;
        }

        .summary {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }

        .right {
          width: 300px;
        }

        .line {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }

        .discount {
          color: green;
        }

        .total {
          font-weight: bold;
          font-size: 18px;
        }

        .signature {
          margin-top: 40px;
          text-align: right;
        }

        .sign {
          width: 120px;
        }

        .logoBottom {
          width: 60px;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
