"use client";

import { useEffect, useState } from "react";
import { getInvoice } from "@/lib/an-sdk/invoices";

/**
 * Invoice/order verification page. Previously this always rendered a
 * hardcoded "VALID" regardless of the id in the URL — fixed to actually
 * check whether the invoice exists. There's no dedicated verify endpoint
 * in the original backend (see backend-reference/API_CONTRACT.md), so
 * this treats "invoice fetch succeeded" as verified for now; AN group may
 * want a purpose-built /api/invoice/:id/verify that also checks things
 * like tamper signatures.
 */
export default function Verify({ params }) {
  const [state, setState] = useState("checking");
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (!params?.id) return;
    let cancelled = false;

    getInvoice(params.id)
      .then((data) => {
        if (cancelled) return;
        setInvoice(data?.invoice || data);
        setState("valid");
      })
      .catch(() => {
        if (!cancelled) setState("invalid");
      });

    return () => {
      cancelled = true;
    };
  }, [params?.id]);

  return (
    <div className="wrap">
      <div className="card">
        <h2>Invoice Verification</h2>
        <p className="orderId">Order ID: {params.id}</p>

        {state === "checking" && <p>Checking...</p>}

        {state === "valid" && (
          <>
            <p className="valid">✅ VALID</p>
            {invoice?.invoiceNumber && <p>Invoice #{invoice.invoiceNumber}</p>}
            {invoice?.totalAmount != null && <p>Amount: ₹{invoice.totalAmount}</p>}
          </>
        )}

        {state === "invalid" && <p className="invalid">✕ Could not verify this invoice</p>}
      </div>

      <style jsx>{`
        .wrap {
          min-height: 50vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }
        .card {
          background: #fff;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          text-align: center;
          min-width: 280px;
        }
        .orderId {
          color: #888;
          font-size: 13px;
        }
        .valid {
          color: #16a34a;
          font-weight: 700;
          font-size: 18px;
        }
        .invalid {
          color: #e11d48;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
