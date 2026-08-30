"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrder } from "@/lib/an-sdk/orders";
import { anPost } from "@/lib/an-sdk/client";

const AN_API = process.env.NEXT_PUBLIC_AN_API || "";

export default function InvoicePage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const o = await getOrder(id);
        if (o.success) setOrder(o.order);
        else setLoadError(o.message || "Order not found");
      } catch (err) {
        console.error("INVOICE LOAD ERROR:", err);
        setLoadError(err?.message || "Could not load this order");
      }
    };

    load();
  }, [id]);

  /* ================= LOADING ================= */

  if (loadError) {
    return <div style={{ padding: 20 }}>{loadError}</div>;
  }

  if (!order) {
    return <div>Loading...</div>;
  }

  /* ================= FUNCTIONS ================= */

  const resendEmail = async (id) => {
    try {
      const data = await anPost("/api/orders/resend-email", { id });

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
      const data = await anPost("/api/orders/resend-whatsapp", { id });

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

        <button onClick={() => window.print()}>
          ⬇ Download / Print PDF
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

      {/* ================= INVOICE =================
          ANgroup already owns a full, maintained invoice layout (QR code,
          HSN summary, B2B/B2C handling, per-business template selection —
          see src/app/invoice/[invoiceNumber]/page.tsx) at
          {AN_API}/invoice/{invoiceNumber}. This used to be reimplemented
          here from scratch with a fraction of that layout's fields and no
          way to pick up template changes made in ANgroup's admin — now it
          just embeds the real thing so both always match. */}

      {order.invoice?.invoiceNumber ? (
        <iframe
          src={`${AN_API}/invoice/${order.invoice.invoiceNumber}`}
          className="invoiceFrame"
          title={`Invoice ${order.invoice.invoiceNumber}`}
        />
      ) : (
        <div style={{ padding: 20, textAlign: "center" }}>
          No invoice has been generated for this order yet.
        </div>
      )}

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

        .invoiceFrame {
          display: block;
          width: 100%;
          max-width: 950px;
          margin: 0 auto;
          height: 100vh;
          border: none;
        }

        @media print {
          .page {
            background: white;
            padding: 0;
          }

          .topbar {
            display: none;
          }

          .invoiceFrame {
            max-width: 100%;
          }
        }

      `}</style>

    </div>
  );
}
