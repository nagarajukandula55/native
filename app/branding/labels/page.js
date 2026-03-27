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

  /* ================= GENERATE SINGLE LABEL PDF ================= */
  const generatePDF = (label, doc = null, startY = 10) => {
    const pdf = doc || new jsPDF({ orientation: "portrait", unit: "mm", format: "a6" });
    const yOffset = startY;

    const img = new Image();
    img.src = "/logo.png"; // change to dynamic if needed
    img.onload = () => {
      if (!doc) pdf.addImage(img, "PNG", 10, 5, 40, 15);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Product: ${label.name}`, 10, yOffset + 20);
      pdf.setFont("helvetica", "normal");
      pdf.text(`SKU: ${label.sku}`, 10, yOffset + 27);
      pdf.text(`Size: ${label.size}`, 10, yOffset + 34);
      pdf.text(`Quality: ${label.quality}`, 10, yOffset + 41);
      pdf.text(`Price: ₹${label.price}`, 10, yOffset + 48);

      if (label.nutrition) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Nutrition:", 10, yOffset + 55);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Calories: ${label.nutrition.calories}`, 10, yOffset + 62);
        pdf.text(`Protein: ${label.nutrition.protein}`, 10, yOffset + 69);
        pdf.text(`Fat: ${label.nutrition.fat}`, 10, yOffset + 76);
        pdf.text(`Carbs: ${label.nutrition.carbs}`, 10, yOffset + 83);
      }

      if (!doc) pdf.save(`${label.name}-label.pdf`);
    };

    return pdf;
  };

  /* ================= BULK PDF ================= */
  const generateBulkPDF = () => {
    if (labels.length === 0) return alert("No labels to generate!");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a6" });
    let yPosition = 10;

    labels.forEach((label, idx) => {
      if (idx !== 0) doc.addPage();
      generatePDF(label, doc, yPosition);
    });

    setTimeout(() => {
      doc.save("All-Labels.pdf");
    }, 500);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 15 }}>Product Labels</h1>

      <div style={{ marginBottom: 15 }}>
        <a
          href="/branding/labels/create"
          style={{ marginRight: 10, color: "#2563eb", display: "inline-block" }}
        >
          + Create Label
        </a>
        <button
          onClick={generateBulkPDF}
          style={{
            background: "#10b981",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Export All Labels PDF
        </button>
      </div>

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
