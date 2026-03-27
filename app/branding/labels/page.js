"use client";

import { useEffect, useState } from "react";
import LabelPDF from "./LabelPDF";

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

  useEffect(() => { fetchLabels(); }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Labels</h1>
      <a href="/branding/labels/create" style={{ marginBottom: 10, display: "inline-block", color: "#2563eb" }}>+ Create Label</a>

      {labels.map((label) => (
        <div key={label._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
          <h3>{label.productName}</h3>
          <p>Nutrition: Calories {label.nutrition?.calories}, Protein {label.nutrition?.protein}g, Fat {label.nutrition?.fat}g, Carbs {label.nutrition?.carbs}g</p>
          <p>AI Description: {label.aiText}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => deleteLabel(label._id)} style={{ color: "red" }}>Delete</button>
            <LabelPDF label={label} />
          </div>
        </div>
      ))}
    </div>
  );
}
