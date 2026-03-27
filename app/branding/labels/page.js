"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LabelsPage() {
  const router = useRouter();
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
      <h1>Product Labels</h1>
      <button onClick={() => router.push("/branding/labels/create")} style={{ marginBottom: 10, padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6 }}>+ Create Label</button>
      {labels.map((label) => (
        <div key={label._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10, borderRadius: 6, background: "#fff" }}>
          <h3>{label.name} ({label.sku})</h3>
          <p>Size: {label.size}, Quality: {label.quality}</p>
          <p>Price: ₹{label.price}</p>
          <p>Nutrition: Calories {label.nutrition?.calories}, Protein {label.nutrition?.protein}, Fat {label.nutrition?.fat}, Carbs {label.nutrition?.carbs}</p>
          <p>Front Text: {label.frontText}</p>
          <p>Rear Text: {label.rearText}</p>
          <p>Regulatory Info: {label.regulatoryInfo}</p>
          <button onClick={() => deleteLabel(label._id)} style={{ color: "red", marginRight: 10 }}>Delete</button>
          <button onClick={() => router.push(`/branding/labels/edit/${label._id}`)} style={{ color: "blue" }}>Edit</button>
        </div>
      ))}
    </div>
  );
}
