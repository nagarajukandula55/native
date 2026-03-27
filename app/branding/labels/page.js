"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

export default function LabelsPage() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLabels = async () => {
    try {
      const res = await axios.get("/api/branding/labels");
      if (res.data.success) setLabels(res.data.labels);
    } catch (err) {
      console.error("Fetch Labels Error:", err);
    }
    setLoading(false);
  };

  const deleteLabel = async (id) => {
    if (!confirm("Delete this label?")) return;
    try {
      await axios.delete("/api/branding/labels", { data: { id } });
      fetchLabels();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, []);

  if (loading) return <p>Loading Labels...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Brand Labels</h1>
      <Link
        href="/branding/labels/create"
        style={{ display: "inline-block", marginBottom: 20, color: "#2563eb" }}
      >
        + Create New Label
      </Link>

      {labels.length === 0 && <p>No labels yet.</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {labels.map((label) => (
          <div
            key={label._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 6,
              padding: 15,
              width: 300,
            }}
          >
            <h3>{label.name} ({label.sku})</h3>
            <p>Size: {label.size}, Quality: {label.quality}</p>
            <p>Price: ₹{label.price}</p>
            <p>
              Nutrition: Calories {label.nutrition?.calories || "-"}, Protein {label.nutrition?.protein || "-"}, Fat {label.nutrition?.fat || "-"}, Carbs {label.nutrition?.carbs || "-"}
            </p>
            <p>{label.description}</p>

            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button
                onClick={() => deleteLabel(label._id)}
                style={{ color: "red" }}
              >
                Delete
              </button>
              <Link
                href={`/branding/labels/edit/${label._id}`}
                style={{ color: "#2563eb" }}
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
