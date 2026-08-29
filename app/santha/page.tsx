"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { getStoredPincode, PINCODE_CHANGED_EVENT } from "@/lib/pincode";
import { getMarketSessions, createGroceryOrder, GroceryOrderItemInput } from "@/lib/an-sdk/groceries";
import { ApiError } from "@/lib/an-sdk/client";
import { previewNextSanthaDate } from "@/lib/santhaDate";

type Row = GroceryOrderItemInput;

const emptyRow = (): Row => ({ name: "", quantity: 1, unit: "", notes: "" });

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SanthaPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [pincode, setPincode] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setPincode(getStoredPincode());
    const onChange = (e: any) => setPincode(e.detail || getStoredPincode());
    window.addEventListener(PINCODE_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(PINCODE_CHANGED_EVENT, onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setSessionsLoading(true);
    setSessionsError("");
    getMarketSessions(pincode)
      .then((list) => {
        if (cancelled) return;
        setSessions(list);
        setSelectedSessionId((prev) =>
          list.some((s: any) => s._id === prev) ? prev : list[0]?._id || ""
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setSessionsError(err instanceof ApiError ? err.message : "Could not load santha sessions");
      })
      .finally(() => {
        if (!cancelled) setSessionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pincode]);

  const selectedSession = sessions.find((s) => s._id === selectedSessionId);

  const updateRow = (idx: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };
  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!user) {
      router.push("/login?next=/santha");
      return;
    }
    if (!pincode) {
      setSubmitError("Please set your delivery pincode first (top bar).");
      return;
    }
    if (!selectedSessionId) {
      setSubmitError("Please select a santha session.");
      return;
    }
    const items = rows
      .map((r) => ({ ...r, name: r.name.trim() }))
      .filter((r) => r.name);
    if (!items.length) {
      setSubmitError("Add at least one item.");
      return;
    }

    setSubmitting(true);
    try {
      const order = await createGroceryOrder({
        type: "SANTHA",
        customerId: user.id,
        pincode,
        marketSessionId: selectedSessionId,
        items,
      });
      router.push(`/santha/orders/${order._id}`);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Could not submit order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="headRow">
        <h1>Santha (Weekly Market)</h1>
        <Link href="/santha/orders" className="link">
          My Santha Orders
        </Link>
      </div>
      <p className="sub">
        List what you need for this week's santha — items are picked up and delivered the same day
        the market runs.
      </p>

      {!pincode && (
        <p className="warn">Set your delivery pincode (top bar) to see santha sessions serving your area.</p>
      )}

      <div className="section">
        <h2>1. Choose a santha session</h2>
        {sessionsLoading && <p>Loading sessions…</p>}
        {sessionsError && <p className="error">{sessionsError}</p>}
        {!sessionsLoading && !sessionsError && pincode && !sessions.length && (
          <p className="warn">
            Santha isn't available in pincode {pincode} yet — no sessions currently serve this
            area. Try a different pincode, or check back soon.
          </p>
        )}
        {!!sessions.length && (
          <div className="sessionGrid">
            {sessions.map((session) => (
              <button
                type="button"
                key={session._id}
                className={`sessionCard ${selectedSessionId === session._id ? "selected" : ""}`}
                onClick={() => setSelectedSessionId(session._id)}
              >
                <p className="sessionName">{session.name}</p>
                <p className="sessionMeta">
                  Every {WEEKDAY_NAMES[session.weekday] || "—"} · cutoff {session.cutoffTime}
                </p>
              </button>
            ))}
          </div>
        )}
        {selectedSession && (() => {
          const { plannedFor, cutoffPassed } = previewNextSanthaDate(
            selectedSession.weekday,
            selectedSession.cutoffTime,
            new Date()
          );
          const plannedForLabel = plannedFor.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          return (
            <>
              {cutoffPassed && (
                <p className="cutoffNote">
                  Today's cutoff ({selectedSession.cutoffTime}) for this santha has already
                  passed — your order will be planned for next week instead.
                </p>
              )}
              <p className="hint">
                Your order will be picked up on <strong>{plannedForLabel}</strong>{" "}
                (every {WEEKDAY_NAMES[selectedSession.weekday]}, cutoff {selectedSession.cutoffTime}).
              </p>
            </>
          );
        })()}
      </div>

      <form className="section" onSubmit={handleSubmit}>
        <h2>2. List your items</h2>
        <div className="items">
          {rows.map((row, idx) => (
            <div className="itemRow" key={idx}>
              <input
                placeholder="Item name"
                value={row.name}
                onChange={(e) => updateRow(idx, { name: e.target.value })}
                className="itemName"
              />
              <input
                type="number"
                min={0}
                step="any"
                placeholder="Qty"
                value={row.quantity}
                onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })}
                className="itemQty"
              />
              <input
                placeholder="Unit (kg, pcs...)"
                value={row.unit}
                onChange={(e) => updateRow(idx, { unit: e.target.value })}
                className="itemUnit"
              />
              <input
                placeholder="Notes (optional)"
                value={row.notes}
                onChange={(e) => updateRow(idx, { notes: e.target.value })}
                className="itemNotes"
              />
              <button
                type="button"
                className="removeBtn"
                onClick={() => removeRow(idx)}
                disabled={rows.length === 1}
                title="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="addBtn" onClick={addRow}>
          + Add item
        </button>

        {submitError && <p className="error">{submitError}</p>}

        <button type="submit" className="submitBtn" disabled={submitting || userLoading}>
          {submitting ? "Submitting…" : "Request Quote"}
        </button>
      </form>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .headRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .link {
          color: #c28b45;
          font-weight: 600;
          text-decoration: none;
        }
        .sub {
          color: #666;
          margin: 8px 0 24px;
        }
        .warn {
          background: #fff7e6;
          border: 1px solid #f0c36d;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .section {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }
        h2 {
          margin: 0 0 14px;
          font-size: 16px;
        }
        .sessionGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 10px;
        }
        .sessionCard {
          text-align: left;
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 12px 14px;
          background: #fafafa;
          cursor: pointer;
        }
        .sessionCard.selected {
          border-color: #c28b45;
          background: #fff7ec;
        }
        .sessionName {
          font-weight: 600;
          margin: 0 0 4px;
        }
        .sessionMeta {
          margin: 0;
          font-size: 12px;
          color: #777;
        }
        .hint {
          margin: 14px 0 0;
          font-size: 13px;
          color: #7c5a1e;
        }
        .cutoffNote {
          margin: 14px 0 0;
          font-size: 13px;
          color: #b45309;
          background: #fff7e6;
          border: 1px solid #f0c36d;
          padding: 8px 12px;
          border-radius: 8px;
        }
        .items {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }
        .itemRow {
          display: grid;
          grid-template-columns: 2fr 0.7fr 1fr 1.5fr auto;
          gap: 8px;
        }
        .itemRow input {
          padding: 8px 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }
        .removeBtn {
          border: none;
          background: #f4f4f4;
          border-radius: 8px;
          cursor: pointer;
        }
        .addBtn {
          border: 1px dashed #c28b45;
          background: none;
          color: #c28b45;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        .error {
          color: #e11d48;
          margin-top: 12px;
        }
        .submitBtn {
          display: block;
          margin-top: 16px;
          padding: 12px 24px;
          background: #c28b45;
          color: #fff;
          border: none;
          border-radius: 30px;
          font-weight: 700;
          cursor: pointer;
        }
        .submitBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 640px) {
          .itemRow {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
