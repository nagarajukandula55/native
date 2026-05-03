"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://YOUR-RENDER-URL.onrender.com");

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);
  const [prs, setPrs] = useState([]);

  useEffect(() => {
    socket.on("event", (data) => {
      setEvents((prev) => [data, ...prev]);
    });

    socket.on("ai-analysis", (data) => {
      setAiLogs((prev) => [data, ...prev]);
    });

    socket.on("pr-created", (data) => {
      setPrs((prev) => [data, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🧠 ANu Live DevOps Dashboard</h1>

      {/* LIVE EVENTS */}
      <div>
        <h2>🚨 Live CI Events</h2>
        {events.map((e, i) => (
          <pre key={i}>{JSON.stringify(e, null, 2)}</pre>
        ))}
      </div>

      {/* AI ANALYSIS */}
      <div>
        <h2>🧠 AI Analysis</h2>
        {aiLogs.map((a, i) => (
          <pre key={i} style={{ color: "green" }}>
            {a.repo}
            {"\n"}
            {a.patch}
          </pre>
        ))}
      </div>

      {/* PR TRACKING */}
      <div>
        <h2>🚀 PRs Created</h2>
        {prs.map((p, i) => (
          <pre key={i}>{JSON.stringify(p, null, 2)}</pre>
        ))}
      </div>
    </div>
  );
}
