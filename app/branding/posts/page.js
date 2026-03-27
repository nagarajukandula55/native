"use client";

import { useEffect, useState } from "react";

export default function SocialPostsPage() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState("instagram"); // default template

  /* ================= FETCH LABELS ================= */
  const fetchLabels = async () => {
    const res = await fetch("/api/branding/labels");
    const data = await res.json();
    if (data.success) setLabels(data.labels);
    setLoading(false);
  };

  useEffect(() => { fetchLabels(); }, []);

  /* ================= GENERATE POST ================= */
  const generatePost = (label) => {
    const width = template === "instagram" ? 1080 : template === "facebook" ? 1200 : 1024;
    const height = template === "instagram" ? 1080 : template === "facebook" ? 628 : 512;

    // create canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // background
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(0, 0, width, height);

    // logo
    const img = new Image();
    img.src = "/logo.png";
    img.onload = () => {
      ctx.drawImage(img, 20, 20, 150, 60);

      // product name
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "#111";
      ctx.fillText(label.name, 50, 150);

      // price
      ctx.font = "bold 36px Arial";
      ctx.fillStyle = "#10b981";
      ctx.fillText(`₹${label.price}`, 50, 220);

      // greeting
      ctx.font = "28px Arial";
      ctx.fillStyle = "#2563eb";
      ctx.fillText("Grab yours today!", 50, 280);

      // nutrition info (optional)
      if (label.nutrition) {
        ctx.font = "20px Arial";
        ctx.fillStyle = "#111";
        ctx.fillText(`Calories: ${label.nutrition.calories}`, 50, 340);
        ctx.fillText(`Protein: ${label.nutrition.protein}g`, 50, 370);
        ctx.fillText(`Fat: ${label.nutrition.fat}g`, 50, 400);
        ctx.fillText(`Carbs: ${label.nutrition.carbs}g`, 50, 430);
      }

      // download image
      const link = document.createElement("a");
      link.download = `${label.name}-${template}-post.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 15 }}>Social Media Posts</h1>

      <div style={{ marginBottom: 15 }}>
        <label style={{ marginRight: 10 }}>Select Template: </label>
        <select value={template} onChange={(e) => setTemplate(e.target.value)}>
          <option value="instagram">Instagram (1080x1080)</option>
          <option value="facebook">Facebook (1200x628)</option>
          <option value="twitter">Twitter (1024x512)</option>
        </select>
      </div>

      {labels.length === 0 && <p>No labels available to generate posts.</p>}

      {labels.map((label) => (
        <div key={label._id} style={{ border: "1px solid #ddd", padding: 15, marginBottom: 15, borderRadius: 8 }}>
          <h3>{label.name} ({label.sku})</h3>
          <p>Price: ₹{label.price}</p>
          <button
            onClick={() => generatePost(label)}
            style={{ background: "#2563eb", color: "#fff", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}
          >
            Generate {template} Post
          </button>
        </div>
      ))}
    </div>
  );
}
