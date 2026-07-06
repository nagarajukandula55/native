"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { applyAsVendor, getMyVendorStatus } from "@/lib/an-sdk/vendors";
import { ApiError } from "@/lib/an-sdk/client";

const PERKS = [
  {
    title: "Reach Native's customers",
    body: "List your products in front of shoppers who already trust the Native brand for healthy, authentic food.",
  },
  {
    title: "One dashboard for everything",
    body: "Manage your catalog, track orders, and see payouts from a single vendor dashboard.",
  },
  {
    title: "Same secure login",
    body: "Sign in with the same AN group account you already use across other properties.",
  },
];

export default function SellPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [status, setStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    gstNumber: "",
    category: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setCheckingStatus(false);
      return;
    }

    setForm((f) => ({
      ...f,
      contactName: user.name || f.contactName,
      email: user.email || f.email,
      phone: user.phone || f.phone,
    }));

    getMyVendorStatus()
      .then((data) => setStatus(data?.status || data || null))
      .catch(() => setStatus(null))
      .finally(() => setCheckingStatus(false));
  }, [user, userLoading]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.businessName || !form.contactName || !form.email) {
      setError("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await applyAsVendor(form);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't submit your application right now. Please try again shortly."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const vendorState = status?.status || status?.state;

  return (
    <div className="wrap">
      <section className="hero">
        <h1>Sell on Native</h1>
        <p>
          Bring your products to Native's marketplace and reach customers who
          care about authentic, natural food — the same way vendors onboard
          across the AN group.
        </p>
      </section>

      <section className="perks">
        {PERKS.map((p) => (
          <div className="perk" key={p.title}>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </div>
        ))}
      </section>

      <section className="formSection">
        {!user && !userLoading ? (
          <div className="card center">
            <p>Log in or create an account first to apply as a vendor.</p>
            <div className="ctaRow">
              <Link href="/login?next=/sell" className="btn">
                Login
              </Link>
              <Link href="/signup?next=/sell" className="btnGhost">
                Sign up
              </Link>
            </div>
          </div>
        ) : checkingStatus ? (
          <p>Checking your vendor status...</p>
        ) : vendorState === "active" ? (
          <div className="card center">
            <p>You're already an approved vendor.</p>
            <Link href="/vendor/dashboard" className="btn">
              Go to vendor dashboard
            </Link>
          </div>
        ) : vendorState === "pending" ? (
          <div className="card center">
            <p>
              Your application is under review. We'll notify you once it's
              approved.
            </p>
          </div>
        ) : submitted ? (
          <div className="card center">
            <p>
              Thanks! Your application has been submitted. We'll be in touch
              once it's reviewed.
            </p>
          </div>
        ) : (
          <form className="card" onSubmit={handleSubmit}>
            <h2>Apply to become a vendor</h2>

            <input
              placeholder="Business name *"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="input"
            />
            <input
              placeholder="Contact name *"
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              className="input"
            />
            <input
              placeholder="Email *"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
            />
            <input
              placeholder="GST number (if applicable)"
              value={form.gstNumber}
              onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
              className="input"
            />
            <input
              placeholder="Product category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input"
            />
            <textarea
              placeholder="Tell us about what you'd like to sell"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="textarea"
              rows={4}
            />

            {error && <p className="error">{error}</p>}

            <button className="btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit application"}
            </button>
          </form>
        )}
      </section>

      <style jsx>{`
        .wrap {
          max-width: 960px;
          margin: 0 auto;
          padding: 40px 20px 60px;
        }
        .hero {
          text-align: center;
          margin-bottom: 36px;
        }
        .hero h1 {
          font-size: 32px;
          margin-bottom: 10px;
        }
        .hero p {
          color: #666;
          max-width: 560px;
          margin: 0 auto;
        }
        .perks {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .perk {
          background: #fff;
          border-radius: 12px;
          padding: 22px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        .perk h3 {
          margin: 0 0 8px;
          color: #c28b45;
          font-size: 16px;
        }
        .perk p {
          margin: 0;
          font-size: 13px;
          color: #666;
        }
        .card {
          background: #fff;
          border-radius: 12px;
          padding: 32px;
          max-width: 520px;
          margin: 0 auto;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .card.center {
          text-align: center;
          align-items: center;
        }
        .card h2 {
          margin: 0 0 6px;
          font-size: 20px;
        }
        .input,
        .textarea {
          width: 100%;
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
        }
        .input:focus,
        .textarea:focus {
          border-color: #c28b45;
        }
        .error {
          color: #e11d48;
          font-size: 13px;
        }
        .btn {
          padding: 13px;
          background: #c28b45;
          color: #fff;
          border: none;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          display: inline-block;
        }
        .btn:hover {
          background: #a36d32;
        }
        .btn:disabled {
          opacity: 0.7;
          cursor: default;
        }
        .btnGhost {
          padding: 13px;
          background: #fff;
          color: #c28b45;
          border: 1px solid #c28b45;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        .ctaRow {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
