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
      try {
        const o = await fetch(`/api/orders/${id}`).then((r) =>
          r.json()
        );

        const c = await fetch(`/api/company`).then((r) =>
          r.json()
        );

        if (o.success) setOrder(o.order);

        if (c.success) setCompany(c.data);
      } catch (err) {
        console.error("INVOICE LOAD ERROR:", err);
      }
    };

    load();
  }, [id]);

  /* ================= LOADING ================= */

  if (!order || !company) {
    return <div>Loading...</div>;
  }

  /* ================= BILLING ================= */

  const billing = {
    itemCount:
      order.billing?.itemCount ||
      order.items?.length ||
      0,

    subtotal:
      order.billing?.subtotal ||
      order.items?.reduce(
        (a, b) => a + b.price * b.qty,
        0
      ) ||
      0,

    discount:
      order.billing?.discount || 0,

    taxableAmount:
      order.billing?.taxableAmount || 0,

    cgst:
      order.billing?.cgst || 0,

    sgst:
      order.billing?.sgst || 0,

    igst:
      order.billing?.igst || 0,

    total:
      order.billing?.grandTotal ||
      order.amount ||
      0,
  };

  /* ================= GST MODE ================= */

  const isInterState =
    Number(billing.igst || 0) > 0;

  /* ================= VERIFY URL ================= */

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${order.orderId}`
      : "";

  /* ================= FUNCTIONS ================= */

  const resendEmail = async (id) => {
    try {
      const res = await fetch(
        `/api/orders/resend-email`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      const data = await res.json();

      alert(
        data.success
          ? "Email Sent ✅"
          : data.message
      );
    } catch (err) {
      console.error(err);
      alert("Email failed");
    }
  };

  const resendWhatsApp = async (id) => {
    try {
      const res = await fetch(
        `/api/orders/resend-whatsapp`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      const data = await res.json();

      alert(
        data.success
          ? "WhatsApp Sent ✅"
          : data.message
      );
    } catch (err) {
      console.error(err);
      alert("WhatsApp failed");
    }
  };

  return (
    <div className="page">

      {/* ================= TOPBAR ================= */}

      <div className="topbar">

        <button
          onClick={() =>
            window.open(
              `/api/invoice/${id}?download=1`
            )
          }
        >
          ⬇ Download PDF
        </button>

        <button
          onClick={() =>
            resendEmail(order._id)
          }
        >
          Resend Email
        </button>

        <button
          onClick={() =>
            resendWhatsApp(order._id)
          }
        >
          Resend WhatsApp
        </button>

      </div>

      {/* ================= INVOICE ================= */}

      <div className="invoice">

        {/* WATERMARK */}

        <div className="watermark">
          {company.companyName}
        </div>

        {/* HEADER */}

        <div className="header">

          <div>
            <h2>{company.companyName}</h2>

            <p>
              {company.brandTagline}
            </p>

            <p>
              {company.addressLine1}
            </p>

            <p>
              {company.city} -{" "}
              {company.pincode}
            </p>

            <p>
              GSTIN: {company.gstin}
            </p>
          </div>

          <div className="right">

            <h1>TAX INVOICE</h1>

            <p>
              Invoice:
              {" "}
              {order.invoice
                ?.invoiceNumber ||
                "NA"}
            </p>

            <p>
              Date:
              {" "}
              {new Date(
                order.createdAt
              ).toLocaleString()}
            </p>

            <p>
              Payment:
              {" "}
              {order.payment?.method}
            </p>

            <p>
              Status:
              {" "}
              {order.payment?.status}
            </p>

            {order.payment
              ?.razorpay_payment_id && (
              <p>
                Txn ID:
                {" "}
                {
                  order.payment
                    .razorpay_payment_id
                }
              </p>
            )}

          </div>

        </div>

        {/* ADDRESS */}

        <div className="addr">

          <div>

            <h4>Bill To</h4>

            <p>
              {order.address?.name}
            </p>

            <p>
              {order.address?.address}
            </p>

            <p>
              {order.address?.city}
              {" - "}
              {order.address?.pincode}
            </p>

            {order.address
              ?.gstNumber && (
              <p>
                GST:
                {" "}
                {
                  order.address
                    .gstNumber
                }
              </p>
            )}

          </div>

          <div>

            <h4>Ship To</h4>

            <p>
              {order.address?.name}
            </p>

            <p>
              {order.address?.address}
            </p>

            <p>
              {order.address?.city}
              {" - "}
              {order.address?.pincode}
            </p>

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
              <th>Taxable</th>
              <th>GST%</th>
              <th>Total</th>
            </tr>

          </thead>

          <tbody>

            {order.items?.map(
              (i, idx) => (

                <tr key={idx}>

                  <td>{idx + 1}</td>

                  <td>{i.name}</td>

                  <td>
                    {i.snapshot?.hsn ||
                      "-"}
                  </td>

                  <td>{i.qty}</td>

                  <td>
                    ₹{i.price}
                  </td>

                  <td>
                    ₹
                    {i.taxableAmount ||
                      0}
                  </td>

                  <td>
                    {i.gstPercent}%
                  </td>

                  <td>
                    ₹{i.total}
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

        {/* SUMMARY */}

        <div className="summary">

          <div>

            <p>
              Total Items:
              {" "}
              {billing.itemCount}
            </p>

          </div>

          <div>

            <p>
              Subtotal:
              {" "}
              ₹{billing.subtotal}
            </p>

            <p>
              Discount:
              {" "}
              ₹{billing.discount}
            </p>

            <p>
              Taxable:
              {" "}
              ₹
              {billing.taxableAmount}
            </p>

            {!isInterState ? (
              <>
                <p>
                  CGST:
                  {" "}
                  ₹{billing.cgst}
                </p>

                <p>
                  SGST:
                  {" "}
                  ₹{billing.sgst}
                </p>
              </>
            ) : (
              <p>
                IGST:
                {" "}
                ₹{billing.igst}
              </p>
            )}

            <h2>
              Total:
              {" "}
              ₹{billing.total}
            </h2>

          </div>

        </div>

        {/* FOOTER */}

        <div className="footer">

          <div>

            <QRCode
              value={verifyUrl}
              size={90}
            />

            <p>
              Scan to Verify
            </p>

          </div>

          <div>

            {company.signatureUrl && (
              <img
                src={
                  company.signatureUrl
                }
                className="sign"
                alt="signature"
              />
            )}

            <p>
              Authorised Signatory
            </p>

          </div>

        </div>

      </div>

      {/* ================= STYLES ================= */}

      <style jsx>{`

        .page {
          background: #f5f5f5;
          min-height: 100vh;
          padding: 20px;
        }

        .topbar {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        button {
          background: black;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .invoice {
          background: white;
          padding: 25px;
          max-width: 900px;
          margin: auto;
          position: relative;
          border-radius: 12px;
        }

        .watermark {
          position: absolute;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 80px;
          opacity: 0.05;
          font-weight: bold;
          pointer-events: none;
        }

        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
        }

        .right {
          text-align: right;
        }

        .addr {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          gap: 20px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        th,
        td {
          border: 1px solid #ddd;
          padding: 8px;
          font-size: 13px;
        }

        th {
          background: black;
          color: white;
        }

        .summary {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }

        .footer {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
          align-items: center;
        }

        .sign {
          height: 60px;
          object-fit: contain;
        }

        @media (max-width: 768px) {

          .header,
          .addr,
          .summary,
          .footer {
            flex-direction: column;
            gap: 20px;
          }

          .right {
            text-align: left;
          }

          table {
            font-size: 11px;
          }

          .invoice {
            padding: 12px;
          }

          .watermark {
            font-size: 40px;
          }
        }

      `}</style>

    </div>
  );
}
