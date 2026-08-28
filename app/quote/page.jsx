"use client";

import { useState } from "react";
import { submitQuoteRequest } from "@/lib/an-sdk/quotes";

export default function QuotePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    gstNumber: "",
    productDescription: "",
    quantity: "",
    targetPrice: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.productDescription.trim()) {
      setError("Please fill in your name, email, and what you're looking for.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await submitQuoteRequest({
        ...form,
        targetPrice: form.targetPrice ? Number(form.targetPrice) : undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err?.message || "Failed to submit — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="container">
        <div className="done">
          <div className="icon">✅</div>
          <h1>Request received</h1>
          <p>We&apos;ll review your requirement and get back to you with a quote shortly.</p>
        </div>
        <style jsx>{`
          .container { max-width: 600px; margin: 60px auto; padding: 0 20px; text-align: center; }
          .icon { font-size: 44px; margin-bottom: 10px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Request a Custom Quote</h1>
      <p className="sub">
        Need a custom product, a bulk/wholesale order, or private-label packaging? Tell us what you need and we&apos;ll send a quote.
      </p>

      <form onSubmit={handleSubmit} className="form">
        <div className="row">
          <input
            placeholder="Your name *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            type="email"
            placeholder="Email *"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="row">
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <input
            placeholder="Company name (for business orders)"
            value={form.companyName}
            onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
          />
        </div>
        <input
          placeholder="GST number (optional, for B2B orders)"
          value={form.gstNumber}
          onChange={(e) => setForm((f) => ({ ...f, gstNumber: e.target.value }))}
        />
        <textarea
          rows={4}
          placeholder="What are you looking for? Product, packaging, customization details... *"
          value={form.productDescription}
          onChange={(e) => setForm((f) => ({ ...f, productDescription: e.target.value }))}
        />
        <div className="row">
          <input
            placeholder="Quantity (e.g. 500 units / 200 kg)"
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Target price (optional, ₹)"
            value={form.targetPrice}
            onChange={(e) => setForm((f) => ({ ...f, targetPrice: e.target.value }))}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Request"}
        </button>
      </form>

      <style jsx>{`
        .container {
          max-width: 640px;
          margin: 40px auto;
          padding: 0 20px 60px;
        }
        h1 {
          margin: 0 0 8px;
        }
        .sub {
          color: #666;
          margin: 0 0 24px;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        input,
        textarea {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font: inherit;
          width: 100%;
        }
        .error {
          color: #d33;
          font-size: 13px;
          margin: 0;
        }
        button {
          padding: 13px;
          border: none;
          border-radius: 30px;
          background: #1f3d2b;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 600px) {
          .row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
