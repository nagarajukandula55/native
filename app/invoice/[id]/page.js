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

  if (!order || !company) return <div>Loading...</div>;

  /* ================= CALCULATIONS ================= */
  const subtotal =
    order.items?.reduce((a, b) => a + b.price * b.qty, 0) || 0;

  const discount = order.billing?.discount || 0;
  const taxable = subtotal - discount;

  const cgst = order.billing?.totalCGST || 0;
  const sgst = order.billing?.totalSGST || 0;
  const igst = order.billing?.totalIGST || 0;

  const total = order.amount;

  /* ================= GST TYPE ================= */
  const isSameState =
    company.stateCode === order.address?.stateCode;

  return (
    <div className="page">

      <div className="invoice">

        {/* ================= HEADER ================= */}
        <div className="header">

          <div>
            <h2>{company.legalName}</h2>
            <p className="tag">{company.brandTagline}</p>
            <p>{company.addressLine1}, {company.addressLine2}</p>
            <p>{company.city} - {company.pincode}</p>
            <p><b>GSTIN:</b> {company.gstin}</p>
          </div>

          <div className="meta">
            <h1>TAX INVOICE</h1>
            <p><b>Invoice No:</b> {order.invoice?.invoiceNumber}</p>
            <p><b>Date:</b> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><b>Order ID:</b> {order.orderId}</p>
          </div>

        </div>

        {/* ================= PARTY DETAILS ================= */}
        <div className="party">

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

          <div>
            <h4>Other Details</h4>
            <p><b>Supply State:</b> {order.address?.state}</p>
            <p><b>Invoice Type:</b> {order.address?.gstNumber ? "B2B" : "B2C"}</p>
            <p><b>Reverse Charge:</b> No</p>
          </div>

        </div>

        {/* ================= ITEMS ================= */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>HSN</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Taxable</th>
              <th>GST%</th>
              <th>Tax</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((i, idx) => {
              const base = i.price * i.qty;
              const gst = (base * i.gstRate) / 100;

              return (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{i.name} ({i.sku})</td>
                  <td>{i.hsn || "-"}</td>
                  <td>{i.qty}</td>
                  <td>₹{i.price}</td>
                  <td>₹{base}</td>
                  <td>{i.gstRate}%</td>
                  <td>₹{gst}</td>
                  <td>₹{base + gst}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ================= SUMMARY ================= */}
        <div className="summary">

          <div />

          <div className="box">
            <p><span>Subtotal</span><span>₹{subtotal}</span></p>

            {discount > 0 && (
              <p className="green">
                <span>Discount</span><span>-₹{discount}</span>
              </p>
            )}

            <p><span>Taxable</span><span>₹{taxable}</span></p>

            {isSameState ? (
              <>
                <p><span>CGST</span><span>₹{cgst}</span></p>
                <p><span>SGST</span><span>₹{sgst}</span></p>
              </>
            ) : (
              <p><span>IGST</span><span>₹{igst}</span></p>
            )}

            <h3><span>Total</span><span>₹{total}</span></h3>
          </div>

        </div>

        {/* ================= DECLARATION ================= */}
        <div className="footer">

          <div className="decl">
            <b>Declaration:</b>
            <p>
              We declare that this invoice shows the actual price of the goods
              described and that all particulars are true and correct.
            </p>
          </div>

          <div className="sign">
            <img src={company.signatureUrl || "/signature.png"} />
            <p>Authorised Signatory</p>
            <img src={company.logoUrl || "/logo.png"} className="logo" />
          </div>

        </div>

      </div>

      {/* ================= STYLES ================= */}
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
          padding: 25px;
          border: 1px solid #000;
        }

        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }

        .meta {
          text-align: right;
        }

        .party {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          margin-top: 15px;
        }

        .party div {
          border: 1px solid #000;
          padding: 8px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }

        th, td {
          border: 1px solid #000;
          padding: 6px;
          font-size: 13px;
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

        .box {
          width: 300px;
        }

        .box p {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #ddd;
          padding: 4px 0;
        }

        h3 {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }

        .footer {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
        }

        .sign img {
          width: 120px;
        }

        .logo {
          width: 60px;
          margin-top: 5px;
        }

        .green {
          color: green;
        }
      `}</style>
    </div>
  );
}
