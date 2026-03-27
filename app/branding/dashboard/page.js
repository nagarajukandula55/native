"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";

export default function BrandingDashboard() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState("instagram");

  const fetchLabels = async () => {
    const res = await fetch("/api/branding/labels");
    const data = await res.json();
    if (data.success) setLabels(data.labels);
    setLoading(false);
  };

  useEffect(() => { fetchLabels(); }, []);

  const deleteLabel = async (id) => {
    if (!confirm("Delete this label?")) return;
    await fetch("/api/branding/labels", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchLabels();
  };

  const downloadPDF = (label) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Product: ${label.name}`, 10, 20);
    doc.text(`SKU: ${label.sku}`, 10, 30);
    doc.text(`Price: ₹${label.price}`, 10, 40);
    if (label.nutrition) {
      doc.text(`Calories: ${label.nutrition.calories}`, 10, 50);
      doc.text(`Protein: ${label.nutrition.protein}g`, 10, 60);
      doc.text(`Fat: ${label.nutrition.fat}g`, 10, 70);
      doc.text(`Carbs: ${label.nutrition.carbs}g`, 10, 80);
    }
    doc.save(`${label.name}-label.pdf`);
  };

  const generatePost = (label) => {
    const width = template === "instagram" ? 1080 : template === "facebook" ? 1200 : 1024;
    const height = template === "instagram" ? 1080 : template === "facebook" ? 628 : 512;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(0, 0, width, height);

    const img = new Image();
    img.src = "/logo.png";
    img.onload = () => {
      ctx.drawImage(img, 20, 20, 150, 60);
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "#111";
      ctx.fillText(label.name, 50, 150);
      ctx.font = "bold 36px Arial";
      ctx.fillStyle = "#10b981";
      ctx.fillText(`₹${label.price}`, 50, 220);
      ctx.font = "28px Arial";
      ctx.fillStyle = "#2563eb";
      ctx.fillText("Grab yours today!", 50, 280);

      if (label.nutrition) {
        ctx.font = "20px Arial";
        ctx.fillStyle = "#111";
        ctx.fillText(`Calories: ${label.nutrition.calories}`, 50, 340);
        ctx.fillText(`Protein: ${label.nutrition.protein}g`, 50, 370);
        ctx.fillText(`Fat: ${label.nutrition.fat}g`, 50, 400);
        ctx.fillText(`Carbs: ${label.nutrition.carbs}g`, 50, 430);
      }

      const link = document.createElement("a");
      link.download = `${label.name}-${template}-post.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Branding Dashboard</h1>

      <div style={{ margin: "15px 0" }}>
        <label>Select Social Template: </label>
        <select value={template} onChange={(e) => setTemplate(e.target.value)}>
          <option value="instagram">Instagram (1080x1080)</option>
          <option value="facebook">Facebook (1200x628)</option>
          <option value="twitter">Twitter (1024x512)</option>
        </select>
      </div>

      <a href="/branding/labels/create" style={{ display: "inline-block", marginBottom: 20, color: "#2563eb" }}>+ Create New Label</a>

      {labels.map(label => (
        <div key={label._id} style={{ border: "1px solid #ddd", padding: 15, marginBottom: 15, borderRadius: 8 }}>
          <h3>{label.name} ({label.sku})</h3>
          <p>Size: {label.size}, Quality: {label.quality}</p>
          <p>Price: ₹{label.price}</p>
          <p>Nutrition: Calories {label.nutrition?.calories}, Protein {label.nutrition?.protein}, Fat {label.nutrition?.fat}, Carbs {label.nutrition?.carbs}</p>
          <div style={{ marginTop: 10 }}>
            <button onClick={() => deleteLabel(label._id)} style={{ color: "red", marginRight: 10 }}>Delete</button>
            <a href={`/branding/labels/edit/${label._id}`} style={{ color: "blue", marginRight: 10 }}>Edit</a>
            <button onClick={() => downloadPDF(label)} style={{ color: "green", marginRight: 10 }}>Download PDF</button>
            <button onClick={() => generatePost(label)} style={{ color: "#111" }}>Generate Post</button>
          </div>
        </div>
      ))}
    </div>
  );
}
