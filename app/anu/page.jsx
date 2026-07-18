"use client";

import { useState } from "react";
import useAuth from "@/lib/useAuth";
import { anu } from "@/lib/an-sdk";

/**
 * ANu — the real assistant, not the old placeholder.
 *
 * The previous version of this page posted bug reports to an unrelated
 * external Render endpoint (native-3u3v.onrender.com/anu/analyze) that had
 * nothing to do with ANgroup, ANu's actual knowledge base, or this site's
 * own data. That's gone. This page now talks to ANgroup's real ANu
 * (POST /api/anu, grounded in this business's own knowledge) for
 * conversation, and to the ANu Issues & Reports inbox (POST /api/anu/issues,
 * surfaced at /admin/anu-issues) when something needs a human to act on it -
 * the same "all notifications pass through ANu" pathway used everywhere
 * else ANu is embedded.
 */
export default function AnuPage() {
  const user = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");

  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSeverity, setReportSeverity] = useState("MEDIUM");
  const [reportStatus, setReportStatus] = useState("");
  const [reporting, setReporting] = useState(false);

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setChatError("");
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const res = await anu.askAnu(nextMessages);
      if (res?.success && res.reply) {
        setMessages([...nextMessages, { role: "assistant", content: res.reply }]);
      } else {
        setChatError(res?.error || "ANu could not answer that right now.");
      }
    } catch (err) {
      setChatError(err?.message || "Could not reach ANu.");
    } finally {
      setSending(false);
    }
  }

  async function submitReport(e) {
    e.preventDefault();
    if (!reportTitle.trim() || !reportDescription.trim() || reporting) return;

    setReporting(true);
    setReportStatus("");
    try {
      await anu.reportIssueToAnu({
        title: reportTitle.trim(),
        description: reportDescription.trim(),
        severity: reportSeverity,
      });
      setReportStatus("Reported to ANu — the team will follow up.");
      setReportTitle("");
      setReportDescription("");
    } catch (err) {
      setReportStatus(err?.message || "Could not submit this report.");
    } finally {
      setReporting(false);
    }
  }

  if (!user) {
    return (
      <div style={{ padding: 40, maxWidth: 640, margin: "0 auto" }}>
        <h1>ANu</h1>
        <p>Sign in to chat with ANu or report an issue.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 640, margin: "0 auto" }}>
      <h1>ANu</h1>
      <p style={{ color: "#666" }}>Ask a question or report a problem — both go straight to ANu.</p>

      <section style={{ marginTop: 24 }}>
        <h2>Chat</h2>
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, minHeight: 160, marginBottom: 12 }}>
          {messages.length === 0 && <p style={{ color: "#999" }}>No messages yet.</p>}
          {messages.map((m, i) => (
            <p key={i} style={{ margin: "8px 0" }}>
              <strong>{m.role === "user" ? "You" : "ANu"}:</strong> {m.content}
            </p>
          ))}
        </div>
        {chatError && <p style={{ color: "#c0392b" }}>{chatError}</p>}
        <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ANu anything…"
            style={{ flex: 1, padding: 8 }}
          />
          <button type="submit" disabled={sending}>
            {sending ? "Sending…" : "Send"}
          </button>
        </form>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Report an issue</h2>
        <form onSubmit={submitReport} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="What's wrong, in a few words"
            style={{ padding: 8 }}
          />
          <textarea
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            placeholder="Describe the issue…"
            style={{ padding: 8, height: 100 }}
          />
          <select value={reportSeverity} onChange={(e) => setReportSeverity(e.target.value)} style={{ padding: 8 }}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <button type="submit" disabled={reporting}>
            {reporting ? "Reporting…" : "Report to ANu"}
          </button>
        </form>
        {reportStatus && <p>{reportStatus}</p>}
      </section>
    </div>
  );
}
