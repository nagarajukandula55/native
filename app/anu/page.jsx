"use client";

import { useState } from "react";

export default function ANuDashboard() {
  const [error, setError] = useState("");
  const [patch, setPatch] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);

    const res = await fetch(
      "https://YOUR-RENDER-URL.onrender.com/anu/analyze",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: "your-repo-name",
          error
        })
      }
    );

    const data = await res.json();

    setPatch(data.patch);
    setLoading(false);
  };

  const createPR = async () => {
    const res = await fetch(
      "https://YOUR-RENDER-URL.onrender.com/anu/create-pr",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: "your-repo-name",
          patch
        })
      }
    );

    const data = await res.json();
    alert("PR Created: " + data.pr?.html_url);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🤖 ANu AI DevOps Dashboard</h1>

      <textarea
        placeholder="Paste error or bug here..."
        value={error}
        onChange={(e) => setError(e.target.value)}
        style={{ width: "100%", height: 120 }}
      />

      <button onClick={analyze} disabled={loading}>
        {loading ? "ANu analyzing..." : "Analyze with ANu"}
      </button>

      {patch && (
        <>
          <h3>🧠 Suggested Fix</h3>
          <pre style={{ background: "#111", color: "#0f0", padding: 10 }}>
            {patch}
          </pre>

          <button onClick={createPR}>
            🚀 Create GitHub PR
          </button>
        </>
      )}
    </div>
  );
}
