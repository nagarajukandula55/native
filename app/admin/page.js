"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// -----------------------------
// 🔥 SOCKET (PRODUCTION SAFE)
// -----------------------------
const socket = io("https://YOUR-RENDER-URL.onrender.com", {
  transports: ["websocket"], // 🚀 avoids polling CORS issues
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000
});

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);
  const [prs, setPrs] = useState([]);
  const [status, setStatus] = useState("connecting...");

  const mounted = useRef(false);

  // -----------------------------
  // 🧠 SAFE STATE UPDATER (prevents duplicates)
  // -----------------------------
  const addToState = (setter, data) => {
    setter((prev) => [data, ...prev].slice(0, 50)); // limit memory
  };

  // -----------------------------
  // 🚀 SOCKET INIT
  // -----------------------------
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    // 🟢 CONNECTION EVENTS
    socket.on("connect", () => {
      setStatus("connected 🟢");

      // IMPORTANT: register tenant (matches backend multi-tenant system)
      socket.emit("register", "shopnative");
    });

    socket.on("disconnect", () => {
      setStatus("disconnected 🔴");
    });

    socket.on("connect_error", () => {
      setStatus("connection error ⚠️");
    });

    // -----------------------------
    // 🚨 CI EVENT (backend: ci_event)
    // -----------------------------
    socket.on("ci_event", (data) => {
      addToState(setEvents, {
        type: "CI_EVENT",
        ...data,
        time: new Date().toISOString()
      });
    });

    // -----------------------------
    // 🧠 AI PATCH (backend: ai_patch)
    // -----------------------------
    socket.on("ai_patch", (data) => {
      addToState(setAiLogs, {
        type: "AI_PATCH",
        ...data,
        time: new Date().toISOString()
      });
    });

    // -----------------------------
    // 🚀 PR CREATED (backend: pr_created)
    // -----------------------------
    socket.on("pr_created", (data) => {
      addToState(setPrs, {
        type: "PR_CREATED",
        ...data,
        time: new Date().toISOString()
      });
    });

    // -----------------------------
    // ⚠️ GLOBAL ERRORS
    // -----------------------------
    socket.on("error", (err) => {
      console.error("ANu error:", err);
    });

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, []);

  // -----------------------------
  // 🎨 UI
  // -----------------------------
  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      
      {/* HEADER */}
      <h1>🧠 ANu Live DevOps Dashboard</h1>
      <p>Status: {status}</p>

      {/* CI EVENTS */}
      <div style={{ marginTop: 30 }}>
        <h2>🚨 Live CI Events</h2>
        {events.length === 0 && <p>No events yet...</p>}

        {events.map((e, i) => (
          <div key={i} style={{ background: "#111", color: "#fff", padding: 10, marginBottom: 10 }}>
            <pre>{JSON.stringify(e, null, 2)}</pre>
          </div>
        ))}
      </div>

      {/* AI LOGS */}
      <div style={{ marginTop: 30 }}>
        <h2>🧠 AI Analysis</h2>
        {aiLogs.length === 0 && <p>No AI logs yet...</p>}

        {aiLogs.map((a, i) => (
          <div key={i} style={{ background: "#0b0b0b", color: "#0f0", padding: 10, marginBottom: 10 }}>
            <div><b>{a.repo}</b></div>
            <pre>{a.patch}</pre>
          </div>
        ))}
      </div>

      {/* PR TRACKING */}
      <div style={{ marginTop: 30 }}>
        <h2>🚀 Pull Requests</h2>
        {prs.length === 0 && <p>No PRs yet...</p>}

        {prs.map((p, i) => (
          <div key={i} style={{ background: "#001a33", color: "#fff", padding: 10, marginBottom: 10 }}>
            <pre>{JSON.stringify(p, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
