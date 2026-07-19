"use client";

import { useState } from "react";
import { raiseTicket, getTicket, addTicketMessage } from "@/lib/an-sdk/support";

export default function SupportPage() {
  const [mode, setMode] = useState("raise"); // "raise" | "track"

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1>Support</h1>
        <p style={styles.subtitle}>Raise an issue or check the status of an existing ticket.</p>

        <div style={styles.tabs}>
          <button
            onClick={() => setMode("raise")}
            style={mode === "raise" ? styles.tabActive : styles.tab}
          >
            Raise a Ticket
          </button>
          <button
            onClick={() => setMode("track")}
            style={mode === "track" ? styles.tabActive : styles.tab}
          >
            Track a Ticket
          </button>
        </div>

        {mode === "raise" ? <RaiseTicketForm /> : <TrackTicket />}
      </div>
    </div>
  );
}

function RaiseTicketForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", orderId: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [ticketNumber, setTicketNumber] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.subject || !form.message || (!form.email && !form.phone)) {
      setError("Please fill your name, subject, message, and at least an email or phone.");
      return;
    }

    try {
      setLoading(true);
      const data = await raiseTicket(form);
      if (data.success) {
        setTicketNumber(data.ticketNumber);
        setForm({ name: "", email: "", phone: "", orderId: "", subject: "", message: "" });
      } else {
        setError(data.message || "Failed to raise ticket");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (ticketNumber) {
    return (
      <div style={styles.successBox}>
        <p>✅ Your ticket has been raised.</p>
        <p>
          Ticket ID: <strong style={styles.tokenText}>{ticketNumber}</strong>
        </p>
        <p style={styles.hint}>Save this ID — use the &quot;Track a Ticket&quot; tab to check its status or add a message.</p>
        <button style={styles.button} onClick={() => setTicketNumber(null)}>
          Raise Another Ticket
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {error && <p style={styles.error}>{error}</p>}
      <input name="name" placeholder="Your Name *" value={form.name} onChange={handleChange} style={styles.input} />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} style={styles.input} />
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} style={styles.input} />
      <input name="orderId" placeholder="Order ID (optional)" value={form.orderId} onChange={handleChange} style={styles.input} />
      <input name="subject" placeholder="Subject *" value={form.subject} onChange={handleChange} style={styles.input} />
      <textarea
        name="message"
        placeholder="Describe your issue *"
        value={form.message}
        onChange={handleChange}
        style={styles.textarea}
      />
      <button type="submit" style={styles.button} disabled={loading}>
        {loading ? "Submitting..." : "Raise Ticket"}
      </button>
    </form>
  );
}

function TrackTicket() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const lookup = async (e) => {
    e.preventDefault();
    setError(null);
    setTicket(null);
    if (!ticketNumber.trim()) return;
    try {
      setLoading(true);
      const data = await getTicket(ticketNumber.trim());
      if (data.success) setTicket(data.ticket);
      else setError(data.message || "Ticket not found");
    } catch (err) {
      setError(err?.data?.message || "Ticket not found");
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    try {
      setSending(true);
      const data = await addTicketMessage(ticket.ticketNumber, reply.trim());
      if (data.success) {
        setTicket(data.ticket);
        setReply("");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <form onSubmit={lookup} style={styles.form}>
        <input
          placeholder="Enter your Ticket ID (e.g. TKT-...)"
          value={ticketNumber}
          onChange={(e) => setTicketNumber(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Looking up..." : "Track Ticket"}
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      {ticket && (
        <div style={styles.ticketBox}>
          <p>
            <strong>{ticket.subject}</strong> — <span style={styles.status}>{ticket.status}</span>
          </p>
          <div style={styles.messages}>
            {ticket.messages.map((m, i) => (
              <div key={i} style={m.from === "ADMIN" ? styles.msgAdmin : styles.msgCustomer}>
                <p style={styles.msgMeta}>
                  {m.authorName || m.from} · {new Date(m.createdAt).toLocaleString()}
                </p>
                <p>{m.message}</p>
              </div>
            ))}
          </div>

          {ticket.status !== "CLOSED" && (
            <div style={{ marginTop: 12 }}>
              <textarea
                placeholder="Add a message..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                style={styles.textarea}
              />
              <button style={styles.button} onClick={sendReply} disabled={sending}>
                {sending ? "Sending..." : "Add Message"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
    background: "#f7f7f7",
    minHeight: "100vh",
  },
  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    width: "100%",
    maxWidth: 600,
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
  },
  subtitle: { color: "#666", marginTop: -8 },
  tabs: { display: "flex", gap: 8, margin: "16px 0 20px" },
  tab: {
    flex: 1,
    padding: "10px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  tabActive: {
    flex: 1,
    padding: "10px",
    borderRadius: 8,
    border: "1px solid #1f3d2b",
    background: "#1f3d2b",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  input: { padding: 12, border: "1px solid #ddd", borderRadius: 6 },
  textarea: { padding: 12, border: "1px solid #ddd", borderRadius: 6, minHeight: 100 },
  button: {
    padding: 12,
    background: "#1f3d2b",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
  },
  error: { color: "#c0392b", fontSize: 14 },
  successBox: { textAlign: "center" },
  tokenText: { fontFamily: "monospace", fontSize: 16, color: "#1f3d2b" },
  hint: { fontSize: 13, color: "#888" },
  ticketBox: { marginTop: 20, borderTop: "1px solid #eee", paddingTop: 16 },
  status: { fontSize: 12, fontWeight: 700, color: "#c28b45" },
  messages: { display: "flex", flexDirection: "column", gap: 8, marginTop: 10, maxHeight: 280, overflowY: "auto" },
  msgCustomer: { background: "#f4f4f4", padding: 10, borderRadius: 8 },
  msgAdmin: { background: "#eaf3ec", padding: 10, borderRadius: 8, marginLeft: 20 },
  msgMeta: { fontSize: 11, color: "#999", marginBottom: 4 },
};
