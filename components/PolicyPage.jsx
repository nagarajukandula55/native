"use client";

/**
 * Shared layout for the legal/policy pages (Privacy Policy, Terms &
 * Conditions, Refund Policy, Shipping Policy). These didn't exist at all
 * before — a live storefront taking payments via Razorpay needs all four
 * live and linked from the site as part of standard payment-gateway
 * compliance, separate from being generally expected by customers.
 *
 * IMPORTANT: the copy in these pages is standard, reasonable boilerplate
 * for an Indian D2C food brand — it is not a substitute for review by
 * actual legal counsel before go-live. Business-specific details (return
 * windows, jurisdiction, grievance officer, etc.) should be confirmed.
 */
export default function PolicyPage({ title, updated, children }) {
  return (
    <div className="policyWrap">
      <div className="policyCard">
        <h1>{title}</h1>
        <p className="updated">Last updated: {updated}</p>
        <div className="body">{children}</div>
      </div>

      <style jsx>{`
        .policyWrap {
          background: #faf8f3;
          padding: 50px 20px 70px;
          min-height: 60vh;
        }
        .policyCard {
          max-width: 820px;
          margin: 0 auto;
          background: #fff;
          border-radius: 14px;
          padding: 44px 48px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        h1 {
          margin: 0 0 6px;
          font-size: 30px;
        }
        .updated {
          color: #888;
          font-size: 13px;
          margin: 0 0 30px;
        }
        .body :global(h2) {
          font-size: 19px;
          margin: 28px 0 10px;
          color: #3a2a1c;
        }
        .body :global(p) {
          line-height: 1.75;
          color: #333;
          margin: 0 0 14px;
        }
        .body :global(ul) {
          line-height: 1.75;
          color: #333;
          margin: 0 0 14px;
          padding-left: 22px;
        }
        .body :global(li) {
          margin-bottom: 6px;
        }
        .body :global(a) {
          color: #c28b45;
          font-weight: 600;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
