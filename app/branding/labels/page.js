"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";

export default function LabelsPage() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLabels = async () => {
    const res = await fetch("/api/branding/labels");
    const data = await res.json();
    if (data.success) setLabels(data.labels);
    setLoading(false);
  };

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

  useEffect(() => { fetchLabels(); }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 15 }}>Labels</h1>
      <a href="/branding/labels/create" style={{ marginBottom: 10, display: "inline-block", color: "#2563eb" }}>+ Create Label</a>

      {labels.map((label) => (
        <div key={label._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10, borderRadius: 8 }}>
          <h3>{label.name} ({label.sku})</h3>
          <p>Size: {label.size}, Quality: {label.quality}</p>
          <p>Price: ₹{label.price}</p>
          <p>Nutrition: Calories {label.nutrition?.calories}, Protein {label.nutrition?.protein}, Fat {label.nutrition?.fat}, Carbs {label.nutrition?.carbs}</p>
          <button onClick={() => deleteLabel(label._id)} style={{ color: "red", marginRight: 10 }}>Delete</button>
          <a href={`/branding/labels/edit/${label._id}`} style={{ color: "blue", marginRight: 10 }}>Edit</a>
          <button onClick={() => downloadPDF(label)} style={{ color: "green" }}>Download PDF</button>
        </div>
      ))}
    </div>
  );
}
