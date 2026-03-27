"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => fetchLabels(), []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Labels</h1>
      <a href="/branding/labels/create" style={{ marginBottom: 10, display: "inline-block", color: "#2563eb" }}>
        + Create Label
      </a>

      {labels.map((label) => (
        <div key={label._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
          <h3>{label.name} ({label.sku})</h3>
          <p>Size: {label.size}, Quality: {label.quality}</p>
          <p>Price: ₹{label.price}</p>
          <p>Nutrition: Calories {label.nutrition?.calories}, Protein {label.nutrition?.protein}, Fat {label.nutrition?.fat}, Carbs {label.nutrition?.carbs}</p>
          <button onClick={() => deleteLabel(label._id)} style={{ color: "red", marginRight: 10 }}>Delete</button>
          <a href={`/branding/labels/create?id=${label._id}`} style={{ color: "blue" }}>Edit</a>
        </div>
      ))}
    </div>
  );
}
