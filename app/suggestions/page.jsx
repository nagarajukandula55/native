"use client";

import { useEffect, useState } from "react";
import { getSuggestions, submitSuggestion, voteSuggestion } from "@/lib/an-sdk/suggestions";

const VOTED_KEY = "native_voted_suggestions";

function getVoted() {
  try {
    return JSON.parse(localStorage.getItem(VOTED_KEY) || "[]");
  } catch {
    return [];
  }
}

function markVoted(id) {
  try {
    const voted = getVoted();
    voted.push(id);
    localStorage.setItem(VOTED_KEY, JSON.stringify(voted));
  } catch {
    /* ignore */
  }
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState([]);
  const [form, setForm] = useState({ name: "", text: "", category: "PRODUCT" });
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    getSuggestions()
      .then((d) => setSuggestions(d?.suggestions || []))
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    setVoted(getVoted());
  }, []);

  async function handleVote(id) {
    if (voted.includes(id)) return;
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, votes: s.votes + 1 } : s)));
    markVoted(id);
    setVoted((v) => [...v, id]);
    try {
      await voteSuggestion(id);
    } catch {
      /* optimistic update stays either way */
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.text.trim()) return;
    setSubmitting(true);
    try {
      await submitSuggestion(form);
      setForm({ name: "", text: "", category: "PRODUCT" });
      load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <h1>Suggestions</h1>
      <p className="sub">Tell us what product or feature you&apos;d like to see — upvote ideas you agree with.</p>

      <form className="form" onSubmit={handleSubmit}>
        <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
          <option value="PRODUCT">Product idea</option>
          <option value="FEATURE">Website feature</option>
          <option value="OTHER">Other</option>
        </select>
        <input
          placeholder="Your name (optional)"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <textarea
          rows={2}
          placeholder="What would you like to see?"
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Suggestion"}
        </button>
      </form>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : suggestions.length === 0 ? (
        <p className="muted">No suggestions yet — be the first!</p>
      ) : (
        <div className="list">
          {suggestions.map((s) => (
            <div key={s.id} className="item">
              <button
                className={`voteBtn ${voted.includes(s.id) ? "voted" : ""}`}
                onClick={() => handleVote(s.id)}
                disabled={voted.includes(s.id)}
              >
                ▲<span>{s.votes}</span>
              </button>
              <div>
                <p className="text">{s.text}</p>
                <p className="meta">{s.category}{s.status !== "NEW" ? ` · ${s.status}` : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .container { max-width: 640px; margin: 40px auto; padding: 0 20px 60px; }
        h1 { margin: 0 0 8px; }
        .sub { color: #666; margin: 0 0 24px; }
        .form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
        select, input, textarea {
          padding: 11px; border: 1px solid #ddd; border-radius: 8px; font: inherit; width: 100%;
        }
        button[type="submit"] {
          padding: 12px; border: none; border-radius: 30px; background: #1f3d2b; color: #fff; font-weight: 700; cursor: pointer;
        }
        button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }
        .muted { color: #777; }
        .list { display: flex; flex-direction: column; gap: 10px; }
        .item {
          display: flex; gap: 14px; align-items: flex-start; border: 1px solid #eee; border-radius: 10px; padding: 12px;
        }
        .voteBtn {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          border: 1px solid #ddd; background: #fff; border-radius: 8px; padding: 6px 10px;
          font-size: 12px; font-weight: 700; color: #1f3d2b; cursor: pointer; min-width: 44px;
        }
        .voteBtn.voted { background: #1f3d2b; color: #fff; border-color: #1f3d2b; cursor: default; }
        .voteBtn:disabled { cursor: default; }
        .text { margin: 0 0 4px; }
        .meta { margin: 0; font-size: 12px; color: #888; }
      `}</style>
    </div>
  );
}
