"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@/context/UserContext";
import { startChat, sendChatMessage, getChatMessages } from "@/lib/an-sdk/chat";

const VISITOR_ID_KEY = "native_chat_visitor_id";
const CONVERSATION_KEY = "native_chat_conversation_id";

function getOrCreateVisitorId() {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

/**
 * Storefront support chat -- works for anonymous visitors (a client-side
 * visitorId persisted in localStorage) and logged-in users alike. Every
 * conversation relays into the same Telegram ops group the order-bot uses
 * (see angroup's api/support/chat/start/route.ts) -- an ops reply in
 * Telegram shows up here on the next poll, no separate admin UI needed.
 */
export default function ChatWidget() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [draft, setDraft] = useState("");
  const [starting, setStarting] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONVERSATION_KEY);
      if (saved) setConversationId(saved);
    } catch {
      /* ignore */
    }
  }, []);

  // Poll for ops replies every 4s while the panel is open.
  useEffect(() => {
    if (!open || !conversationId) return;
    let cancelled = false;
    async function poll() {
      try {
        const data = await getChatMessages(conversationId);
        if (!cancelled) setMessages(data?.messages || []);
      } catch {
        /* ignore -- retried next tick */
      }
    }
    poll();
    const t = setInterval(poll, 4000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [open, conversationId]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleStart(e) {
    e.preventDefault();
    if (!name.trim() || !draft.trim()) return;
    setStarting(true);
    try {
      const data = await startChat({
        name: name.trim(),
        email: email.trim() || undefined,
        visitorId: getOrCreateVisitorId(),
        message: draft.trim(),
      });
      if (data?.conversationId) {
        setConversationId(data.conversationId);
        try {
          localStorage.setItem(CONVERSATION_KEY, data.conversationId);
        } catch {
          /* ignore */
        }
        setMessages([{ id: "local-0", sender: "VISITOR", text: draft.trim(), createdAt: new Date().toISOString() }]);
        setDraft("");
      }
    } finally {
      setStarting(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !conversationId) return;
    setDraft("");
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, sender: "VISITOR", text, createdAt: new Date().toISOString() }]);
    try {
      await sendChatMessage(conversationId, text);
    } catch {
      /* the next poll will resync either way */
    }
  }

  return (
    <>
      <button className="launcher" onClick={() => setOpen((v) => !v)} aria-label="Chat with us">
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="panel">
          <div className="header">
            <strong>Chat with Native</strong>
            <span className="sub">We usually reply within a few hours</span>
          </div>

          {!conversationId ? (
            <form className="startForm" onSubmit={handleStart}>
              <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input
                type="email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <textarea
                rows={3}
                placeholder="How can we help?"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                required
              />
              <button type="submit" disabled={starting}>
                {starting ? "Starting…" : "Start Chat"}
              </button>
            </form>
          ) : (
            <>
              <div className="body" ref={bodyRef}>
                {messages.map((m) => (
                  <div key={m.id} className={`bubble ${m.sender === "VISITOR" ? "mine" : "theirs"}`}>
                    {m.text}
                  </div>
                ))}
              </div>
              <form className="sendForm" onSubmit={handleSend}>
                <input
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button type="submit">Send</button>
              </form>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .launcher {
          position: fixed;
          bottom: 22px;
          right: 90px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #1f3d2b;
          color: #fff;
          border: none;
          font-size: 24px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
          z-index: 100;
          cursor: pointer;
        }

        .panel {
          position: fixed;
          bottom: 88px;
          right: 22px;
          width: min(340px, calc(100vw - 40px));
          max-height: 480px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 100;
        }

        .header {
          background: #1f3d2b;
          color: #fff;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sub {
          font-size: 11px;
          color: #d9c9a3;
        }

        .startForm {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .startForm input,
        .startForm textarea,
        .sendForm input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font: inherit;
        }

        .startForm button,
        .sendForm button {
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: #c28b45;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
        }

        .body {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 200px;
        }

        .bubble {
          max-width: 80%;
          padding: 8px 12px;
          border-radius: 14px;
          font-size: 13px;
          line-height: 1.4;
        }

        .bubble.mine {
          align-self: flex-end;
          background: #1f3d2b;
          color: #fff;
        }

        .bubble.theirs {
          align-self: flex-start;
          background: #f2f0ea;
          color: #222;
        }

        .sendForm {
          display: flex;
          gap: 8px;
          padding: 10px;
          border-top: 1px solid #eee;
        }

        .sendForm input {
          flex: 1;
        }

        .sendForm button {
          padding: 10px 16px;
        }
      `}</style>
    </>
  );
}
