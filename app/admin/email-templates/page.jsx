"use client";

import { useEffect, useState } from "react";

function renderSample(template, sample) {
  if (!template) return "";
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, name) =>
    name === "businessName" ? sample.businessName || "AN Group" : sample[name] ?? ""
  );
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email-templates", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
        if (!selectedKey && data.templates.length) {
          select(data.templates[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (t) => {
    setSelectedKey(t.key);
    setDraft({ subject: t.subject, html: t.html });
    setMsg("");
  };

  const selected = templates.find((t) => t.key === selectedKey);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/email-templates/${selected.key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Saved.");
        await load();
      } else {
        setMsg(data.message || "Save failed");
      }
    } catch (err) {
      setMsg(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!selected) return;
    if (!confirm("Revert this template to the default?")) return;
    try {
      const res = await fetch(`/api/admin/email-templates/${selected.key}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMsg("Reverted to default.");
        await load();
      } else {
        setMsg(data.message || "Reset failed");
      }
    } catch (err) {
      setMsg(err?.message || "Reset failed");
    }
  };

  const handleSendTest = async () => {
    if (!selected || !testTo) return;
    setSending(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/email-templates/${selected.key}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo, subject: draft.subject, html: draft.html }),
      });
      const data = await res.json();
      setMsg(data.success ? `Test email sent to ${testTo}.` : data.message || "Send failed");
    } catch (err) {
      setMsg(err?.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20, display: "flex", gap: 20, alignItems: "flex-start" }}>
      {/* LIST */}
      <div style={{ width: 260, flexShrink: 0 }}>
        <h2 style={{ marginBottom: 12 }}>📧 Email Templates</h2>
        {templates.map((t) => (
          <button
            key={t.key}
            onClick={() => select(t)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              marginBottom: 6,
              border: "1px solid #ddd",
              borderRadius: 8,
              background: t.key === selectedKey ? "#111827" : "#fff",
              color: t.key === selectedKey ? "#fff" : "#111",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              {t.isCustomized ? `Customized (${t.scope})` : "Default"}
            </div>
          </button>
        ))}
      </div>

      {/* EDITOR */}
      {selected && draft && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ marginBottom: 4 }}>{selected.label}</h3>
          <p style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>{selected.description}</p>

          <div style={{ marginBottom: 6, fontSize: 12, color: "#666" }}>
            Available placeholders:{" "}
            {selected.vars.length
              ? selected.vars.map((v) => (
                  <code key={v} style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4, marginRight: 4 }}>
                    {"{{" + v + "}}"}
                  </code>
                ))
              : "none"}
          </div>

          <label style={{ fontSize: 12, fontWeight: 600 }}>Subject</label>
          <input
            value={draft.subject}
            onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
            style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, marginBottom: 12 }}
          />

          <label style={{ fontSize: 12, fontWeight: 600 }}>HTML Body</label>
          <textarea
            value={draft.html}
            onChange={(e) => setDraft({ ...draft, html: e.target.value })}
            rows={16}
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 6,
              marginBottom: 16,
              fontFamily: "monospace",
              fontSize: 12,
            }}
          />

          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: "10px 18px", background: "#111827", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
            >
              {saving ? "Saving..." : "Save"}
            </button>

            {selected.isCustomized && (
              <button
                onClick={handleReset}
                style={{ padding: "10px 18px", background: "#fff", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer" }}
              >
                Revert to Default
              </button>
            )}

            <input
              placeholder="you@example.com"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              style={{ padding: 10, border: "1px solid #ddd", borderRadius: 6, width: 220 }}
            />
            <button
              onClick={handleSendTest}
              disabled={sending || !testTo}
              style={{ padding: "10px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
            >
              {sending ? "Sending..." : "Send Test"}
            </button>
          </div>

          {msg && <p style={{ fontSize: 13, marginBottom: 16 }}>{msg}</p>}

          <h4 style={{ marginBottom: 8 }}>Preview (with sample data)</h4>
          <div
            style={{ border: "1px solid #eee", borderRadius: 8, padding: 16, background: "#fafafa" }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
              Subject: {renderSample(draft.subject, selected.sample)}
            </div>
            <iframe
              srcDoc={renderSample(draft.html, selected.sample)}
              style={{ width: "100%", height: 400, border: "1px solid #ddd", borderRadius: 6, background: "#fff" }}
              title="preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
