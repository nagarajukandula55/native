"use client";

import { useEffect, useState, useCallback } from "react";
import { getMyWallet, requestWalletWithdrawal } from "@/lib/an-sdk/wallet";
import { logEvent } from "@/lib/eventLogger";

const TYPE_LABEL = {
  VENDOR_SETTLEMENT: "Order settlement",
  MANUAL_ADJUSTMENT: "Adjustment",
  WITHDRAWAL: "Withdrawal",
  REVERSAL: "Reversal",
};

function formatDate(d) {
  try {
    return new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return d;
  }
}

export default function VendorWalletPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    getMyWallet()
      .then((res) => {
        if (!res?.success) {
          setError(res?.error || "Couldn't load your wallet.");
        } else {
          setData(res);
          setError("");
        }
      })
      .catch(() => setError("Couldn't load your wallet. Please try again shortly."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleWithdraw(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setFormError("Enter a valid amount.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await requestWalletWithdrawal(value);
      if (!res?.success) {
        setFormError(res?.error || "Couldn't submit the withdrawal request.");
      } else {
        logEvent("wallet_withdrawal_requested", `Withdrawal of ₹${value} requested`, {
          amount: value,
          withdrawalId: res?.withdrawalId,
        });
        setFormSuccess("Withdrawal requested — it'll be reviewed and paid out via bank transfer.");
        setAmount("");
        load();
      }
    } catch {
      setFormError("Couldn't submit the withdrawal request.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading your wallet...</p>;
  if (error) return <p className="notice">{error}</p>;

  const balance = data?.balance || { available: "0.00", pending: "0.00", held: "0.00" };
  const wallet = data?.wallet;
  const transactions = data?.transactions || [];
  const frozen = wallet?.status === "FROZEN";
  const withdrawable = wallet?.withdrawable !== false;
  const withdrawalsEnabled = data?.withdrawalsEnabled !== false;

  return (
    <div>
      <h1>Wallet</h1>
      <p className="sub">Money settled to you from orders — real funds, not promotional credit.</p>

      {frozen && (
        <p className="notice">
          Your wallet is currently frozen{wallet?.frozenReason ? `: ${wallet.frozenReason}` : "."} Contact support
          if this looks wrong.
        </p>
      )}

      <div className="cards">
        <div className="card">
          <p className="value">₹{balance.available}</p>
          <p className="label">Available</p>
        </div>
        <div className="card">
          <p className="value">₹{balance.pending}</p>
          <p className="label">Pending settlement</p>
        </div>
        <div className="card">
          <p className="value">₹{balance.held}</p>
          <p className="label">Reserved</p>
        </div>
      </div>

      {withdrawable && !withdrawalsEnabled && (
        <p className="sub">Withdrawals aren&apos;t open yet — your balance keeps accruing until then.</p>
      )}

      {withdrawable && withdrawalsEnabled && (
        <form className="withdraw" onSubmit={handleWithdraw}>
          <h3>Request withdrawal</h3>
          {formError && <p className="form-error">{formError}</p>}
          {formSuccess && <p className="form-success">{formSuccess}</p>}
          <div className="row">
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={submitting || frozen}
            />
            <button type="submit" disabled={submitting || frozen}>
              {submitting ? "Submitting…" : "Request withdrawal"}
            </button>
          </div>
        </form>
      )}

      <h3>Statement</h3>
      {transactions.length === 0 ? (
        <p className="sub">No transactions yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Status</th>
              <th className="amt">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{formatDate(t.createdAt)}</td>
                <td>{TYPE_LABEL[t.type] || t.type}</td>
                <td>{t.reason || "—"}</td>
                <td>{t.status}</td>
                <td className={`amt ${t.direction === "CREDIT" ? "pos" : "neg"}`}>
                  {t.direction === "CREDIT" ? "+" : "-"}₹{String(t.amount).replace("-", "")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style jsx>{`
        h1 {
          margin-bottom: 4px;
        }
        .sub {
          color: #888;
          margin-bottom: 24px;
        }
        .notice {
          background: #fff4e5;
          border: 1px solid #f0c98a;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }
        .card {
          background: #faf7f2;
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 18px;
        }
        .value {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 4px;
        }
        .label {
          color: #888;
          margin: 0;
          font-size: 13px;
        }
        .withdraw {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 18px;
          margin-bottom: 32px;
        }
        .withdraw h3 {
          margin-top: 0;
        }
        .row {
          display: flex;
          gap: 10px;
        }
        input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        button {
          background: #c28b45;
          color: #fff;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .form-error {
          color: #b42318;
          margin: 0 0 10px;
        }
        .form-success {
          color: #067647;
          margin: 0 0 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          text-align: left;
          padding: 8px 10px;
          border-bottom: 1px solid #eee;
          font-size: 14px;
        }
        .amt {
          text-align: right;
        }
        .amt.pos {
          color: #067647;
          font-weight: 600;
        }
        .amt.neg {
          color: #b42318;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
