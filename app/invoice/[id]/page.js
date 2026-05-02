"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/* ================= AMOUNT IN WORDS ================= */
function numberToWords(num) {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero";

  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000)
      return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 100000)
      return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
    if (n < 10000000)
      return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
    return "";
  };

  return inWords(Math.floor(num)) + " Only";
}

export default function InvoicePage() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/orders/${id}`);
      const json = await res.json();

      if (json.success) {
        setData(json.order);
        setCompany(json.order.company || {});
      }
    };

    if (id) load();
  }, [id]);

  if (!data) return <div>Loading...</div>;

  const subtotal =
    data.items?.reduce((a, b) => a + b.price * b.qty, 0) || 0;

  const discount = data.discount || 0;
  const taxable = subtotal - discount;

  const cgst = data.billing?.cgst || 0;
  const sgst = data.billing?.sgst || 0;
  const igst = data.billing?.igst || 0;

  const total = data.amount;

  return (
    <div className="invoice">

      {/* HEADER */}
      <div className="top">
        <div className="company">
          <img src={company.logo} className="logo" />
          <div>
            <h2>{company.name}</h2>
            <p>{company.tagline}</p>
            <p>{company.address}</p>
            <p>GSTIN: {company.gst}</p>
          </div>
        </div>

        <div className="meta">
          <h2>TAX INVOICE</h2>
          <p>Invoice: {data.invoice?.invoiceNumber}</p>
          <p>Date: {new Date(data.createdAt).toLocaleDateString()}</p>
          <p>Place of Supply: {data.address?.state}</p>
        </div>
      </div>

      {/* BUYER */}
      <div className="block">
        <h4>Bill To</h4>
        <p>{data.address?.name}</p>
        <p>{data.address?.address}</p>
        <p>{data.address?.city}</p>
        <p>GSTIN: {data.address?.gstNumber || "N/A"}</p>
      </div>

      {/* TABLE */}
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>HSN</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Tax</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {data.items.map((i, idx) => (
            <tr key={idx}>
              <td>{i.name}</td>
              <td>{i.hsn || "-"}</td>
              <td>{i.qty}</td>
              <td>₹{i.price}</td>
              <td>18%</td>
              <td>₹{i.price * i.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* SUMMARY */}
      <div className="summary">
        <p>Subtotal: ₹{subtotal}</p>
        {discount > 0 && <p>Discount: -₹{discount}</p>}
        <p>Taxable: ₹{taxable}</p>
        {cgst > 0 && <p>CGST: ₹{cgst}</p>}
        {sgst > 0 && <p>SGST: ₹{sgst}</p>}
        {igst > 0 && <p>IGST: ₹{igst}</p>}
        <h3>Total: ₹{total}</h3>
      </div>

      {/* AMOUNT IN WORDS */}
      <div className="words">
        Amount in words: {numberToWords(total)}
      </div>

      {/* FOOTER */}
      <div className="footer">
        <p>This is a computer generated invoice.</p>
        <p>Authorized Signatory</p>
      </div>

      <style jsx>{`
        .invoice {
          max-width: 900px;
          margin: auto;
          background: white;
          padding: 20px;
          font-size: 13px;
        }

        .top {
          display: flex;
          justify-content: space-between;
        }

        .company {
          display: flex;
          gap: 10px;
        }

        .logo {
          width: 80px;
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

        .summary {
          margin-top: 20px;
          text-align: right;
        }

        .words {
          margin-top: 20px;
          font-weight: bold;
        }

        .footer {
          margin-top: 40px;
          text-align: right;
        }
      `}</style>
    </div>
  );
}
