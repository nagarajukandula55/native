"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";

export default function BrandingDashboard() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Hello, check out our products!");
  const [logoUrl, setLogoUrl] = useState("/logo.png"); // default logo

  const fetchLabels = async () => {
    const res = await fetch("/api/branding/labels");
    const data = await res.json();
    if (data.success) setLabels(data.labels);
    setLoading(false);
  };

  useEffect(() => { fetchLabels(); }, []);

  const generatePDFLabel = (label) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Product: ${label.name}`, 10, 10);
    doc.text(`SKU: ${label.sku}`, 10, 20);
    doc.text(`Size: ${label.size}, Quality: ${label.quality}`, 10, 30);
    doc.text(`Price: ₹${label.price}`, 10, 40);
    doc.save(`${label.name}_label.pdf`);
  };

  const generateSocialPost = (label) => {
    const doc = new jsPDF("landscape", "px", [1080, 1080]); // Instagram post size
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
      // Draw logo
      doc.addImage(img, "PNG", 20, 20, 200, 100);

      // Draw greeting
      doc.setFontSize(28);
      doc.setTextColor(37, 99, 235);
      doc.text(greeting, 250, 100);

      // Draw product info
      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0);
      doc.text(`Product: ${label.name}`, 50, 200);
      doc.text(`SKU: ${label.sku}`, 50, 240);
      doc.text(`Size: ${label.size}`, 50, 280);
      doc.text(`Quality: ${label.quality}`, 50, 320);
      doc.text(`Price: ₹${label.price}`, 50, 360);

      doc.save(`${label.name}_social_post.pdf`);
    };
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Branding Dashboard</h1>

      {/* Logo & Greeting Inputs */}
      <div style={{ margin: "20px 0", border: "1px solid #ddd", padding: 10, borderRadius: 8 }}>
        <h2>Brand Settings</h2>
        <label>
          Logo URL:
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            style={{ width: "100%", margin: "5px 0", padding: 6 }}
          />
        </label>
        <label>
          Default Greeting:
          <input
            type="text"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            style={{ width: "100%", margin: "5px 0", padding: 6 }}
          />
        </label>
      </div>

      <div style={{ margin: "20px 0" }}>
        <Link href="/branding/labels/create" style={{ color: "#2563eb" }}>
          + Create New Label
        </Link>
      </div>

      <h2>Existing Labels</h2>
      {labels.length === 0 && <p>No labels created yet.</p>}

      {labels.map(label => (
        <div key={label._id} style={labelCard}>
          <h3>{label.name} ({label.sku})</h3>
          <p>Size: {label.size}, Quality: {label.quality}</p>
          <p>Price: ₹{label.price}</p>
          <p>Nutrition: Calories {label.nutrition?.calories}, Protein {label.nutrition?.protein}, Fat {label.nutrition?.fat}, Carbs {label.nutrition?.carbs}</p>

          <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
            <Link href={`/branding/labels/edit/${label._id}`} style={{ color: "blue" }}>
              Edit
            </Link>
            <button
              onClick={async () => {
                if (!confirm("Delete this label?")) return;
                await fetch("/api/branding/labels", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: label._id }),
                });
                fetchLabels();
              }}
              style={{ color: "red" }}
            >
              Delete
            </button>
            <button onClick={() => generatePDFLabel(label)}>
              Download Label PDF
            </button>
            <button onClick={() => generateSocialPost(label)}>
              Generate Social Post
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===== STYLES ===== */
const labelCard = {
  border: "1px solid #ddd",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
};
