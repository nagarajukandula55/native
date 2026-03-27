"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BrandingDashboard() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLabels = async () => {
    const res = await fetch("/api/branding/labels");
    const data = await res.json();
    if (data.success) setLabels(data.labels);
    setLoading(false);
  };

  useEffect(() => { fetchLabels(); }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Branding Dashboard</h1>
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
            <button
              onClick={() => {
                // Generate PDF/Label
                const doc = new window.jsPDF();
                doc.text(`Product: ${label.name}`, 10, 10);
                doc.text(`SKU: ${label.sku}`, 10, 20);
                doc.text(`Size: ${label.size}, Quality: ${label.quality}`, 10, 30);
                doc.text(`Price: ₹${label.price}`, 10, 40);
                doc.save(`${label.name}_label.pdf`);
              }}
            >
              Download PDF
            </button>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 30 }}>
        <h2>Social Media Post Generator</h2>
        <p>Create simple branding posts for Instagram, Facebook, etc.</p>
        <button
          onClick={() => alert("This will open a post generation modal (to implement)")}
          style={socialBtn}
        >
          Generate Post
        </button>
      </div>
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

const socialBtn = {
  padding: "10px 20px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
