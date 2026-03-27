"use client";

import { useState } from "react";

export default function SocialPosts() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("Informative");
  const [post, setPost] = useState("");

  const generatePost = async () => {
    const res = await fetch("/api/branding/social-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, style }),
    });
    const data = await res.json();
    if (data.success) setPost(data.content);
  };

  return (
    <div>
      <h1>AI Social Media Post Generator</h1>
      <input placeholder="Topic / Product Name" value={topic} onChange={e => setTopic(e.target.value)} />
      <select value={style} onChange={e => setStyle(e.target.value)}>
        <option value="Informative">Informative</option>
        <option value="Promotional">Promotional</option>
        <option value="Fun">Fun</option>
        <option value="Creative">Creative</option>
      </select>
      <button onClick={generatePost}>Generate Post</button>

      {post && (
        <div style={{ marginTop: 20, border: "1px solid #ccc", padding: 10 }}>
          <h3>Generated Post:</h3>
          <p>{post}</p>
        </div>
      )}
    </div>
  );
}
