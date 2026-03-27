"use client";

import { useState } from "react";

export default function SocialPostsPage() {
  const [prompt, setPrompt] = useState("");
  const [posts, setPosts] = useState([]);

  const generatePost = async () => {
    if (!prompt) return alert("Enter product details or idea");

    // 🔹 Call your AI API here (OpenAI, etc.)
    const res = await fetch("/api/branding/generate-social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (data.success) setPosts([data.post, ...posts]);
  };

  return (
    <div>
      <h1>Social Media Post Generator</h1>
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter product description..." style={{ width: "100%", padding: 8 }} />
      <button onClick={generatePost} style={{ marginTop: 10, padding: 10, background: "#2563eb", color: "#fff" }}>Generate Post</button>

      {posts.map((post, i) => (
        <div key={i} style={{ border: "1px solid #ddd", marginTop: 10, padding: 10 }}>
          <p>{post}</p>
        </div>
      ))}
    </div>
  );
}
