"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";

export default function LabelsPage() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH LABELS ================= */
  const fetchLabels = async () => {
    const res = await fetch("/api/branding/labels");
    const data = await res.json();
    if (data.success) setLabels(data.labels);
    setLoading(false);
  };

  /* ================= DELETE LABEL ================= */
  const deleteLabel = async (id) => {
    if (!confirm("Delete this label?")) return;
    await fetch("/api/branding/labels", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchLabels();
  };

  useEffect(() => { fetchLabels(); }, []);

  /* ================= GENERATE PDF ================= */
  const generatePDF = (label) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a6" });
    
    // LOGO
    const img = new Image();
    img.src = "/logo.png"; // Change if you have dynamic logo path
    img.onload = () => {
      doc.addImage(img, "PNG", 10, 5, 40, 15); // x, y, width, height

      // LABEL CONTENT
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Product: ${label.name}`, 10, 30);
      doc.setFont("helvetica", "normal");
      doc.text(`SKU: ${label.sku}`, 10, 37);
      doc.text(`Size: ${label.size}`, 10, 44);
      doc.text(`Quality: ${label.quality}`, 10, 51);
      doc.text(`Price: ₹${label.price}`, 10, 58);

      // NUTRITION INFO
      if (label.nutrition) {
        doc.setFont("helvetica", "bold");
        doc.text("Nutrition:", 10, 65);
        doc.setFont("helvetica", "normal");
        const y = 72;
        doc.text(`Calories: ${label.nutrition.calories}`, 10, y);
        doc.text(`Protein: ${label.nutrition.protein}`, 10, y + 7);
        doc.text(`Fat: ${label.nutrition.fat}`, 10, y + 14);
        doc.text(`Carbs: ${label.nutrition.carbs}`, 10, y + 21);
      }

      doc.save(`${label.name}-label.pdf`);
    };
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 15 }}>Product Labels</h1>
      <a
        href="/branding/labels/create"
        style={{ marginBottom: 15, display: "inline-block", color: "#2563eb" }}
      >
        + Create Label
      </a>

      {labels.length === 0 && <p>No labels found.</p>}

      {labels.map((label) => (
        <div key={label._id} style={{ border: "1px solid #ddd", padding: 15, marginBottom: 15, borderRadius: 8 }}>
          <h3>{label.name} ({label.sku})</h3>
          <p>Size: {label.size}, Quality: {label.quality}</p>
          <p>Price: ₹{label.price}</p>
          <p>
            Nutrition: Calories {label.nutrition?.calories}, Protein {label.nutrition?.protein}, 
            Fat {label.nutrition?.fat}, Carbs {label.nutrition?.carbs}
          </p>

          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => generatePDF(label)}
              style={{ marginRight: 10, background: "#10b981", color: "#fff", padding: "6px 12px", borderRadius: 6 }}
            >
              Export PDF
            </button>
            <button
              onClick={() => deleteLabel(label._id)}
              style={{ marginRight: 10, background: "#ef4444", color: "#fff", padding: "6px 12px", borderRadius: 6 }}
            >
              Delete
            </button>
            <a
              href={`/branding/labels/edit/${label._id}`}
              style={{ background: "#2563eb", color: "#fff", padding: "6px 12px", borderRadius: 6, textDecoration: "none" }}
            >
              Edit
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
