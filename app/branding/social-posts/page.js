"use client";

import { useState } from "react";

export default function SocialPosts() {
  const [product, setProduct] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [generated, setGenerated] = useState("");

  const generatePost = async () => {
    // Example: can integrate OpenAI GPT for AI captions
    const text = `Check out our new product: ${product}! ${caption} #${hashtags.replace(/,/g, " #")}`;
    setGenerated(text);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Social Media Post Generator</h1>
      <div style={{ display: "grid", gap: 10, maxWidth: 500 }}>
        <input placeholder="Product Name" value={product} onChange={(e) => setProduct(e.target.value)} />
        <input placeholder="Caption / Description" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <input placeholder="Hashtags (comma separated)" value={hashtags} onChange={(e) => setHashtags(e.target.value)} />
        <button onClick={generatePost} style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6 }}>
          Generate Post
        </button>
        {generated && (
          <div style={{ marginTop: 10, padding: 10, border: "1px solid #ddd", borderRadius: 6, background: "#fff" }}>
            <h3>Generated Post</h3>
            <p>{generated}</p>
          </div>
        )}
      </div>
    </div>
  );
}
