"use client";

import { useState } from "react";

export default function SocialPosts() {
  const [caption, setCaption] = useState("");

  const generateAI = async () => {
    const res = await fetch("/api/branding/social/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Generate product social media caption" }),
    });
    const data = await res.json();
    if (data.success) setCaption(data.text);
  };

  return (
    <div>
      <h1>Social Posts</h1>
      <button onClick={generateAI} style={{ marginBottom: 10, background: "#2563eb", color: "#fff", padding: "6px 12px" }}>Generate AI Caption</button>
      <textarea value={caption} readOnly rows={5} style={{ width: "100%", padding: 10 }} />
    </div>
  );
}
