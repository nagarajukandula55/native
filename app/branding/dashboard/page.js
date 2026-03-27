"use client";

import { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import { useReactToPrint } from "react-to-print";

export default function BrandingDashboard() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState("");
  const printRef = useRef();

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

  const handlePrint = useReactToPrint({ content: () => printRef.current });

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Branding Dashboard</h1>

      {/* Logo Upload */}
      <div style={{ marginBottom: 20 }}>
        <h3>Upload Logo</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            setLogoUrl(URL.createObjectURL(file));
          }}
        />
        {logoUrl && <img src={logoUrl} alt="Logo" style={{ maxHeight: 80, marginTop: 10 }} />}
      </div>

      {/* Create Label Link */}
      <a
        href="/branding/labels/create"
        style={{ marginBottom: 10, display: "inline-block", color: "#2563eb" }}
      >
        + Create Label
      </a>

      <div ref={printRef}>
        {labels.map((label) => (
          <div key={label._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
            {logoUrl && <img src={logoUrl} alt="Logo" style={{ maxHeight: 50 }} />}
            <h3>{label.name} ({label.sku})</h3>
            <p>Size: {label.size}, Quality: {label.quality}</p>
            <p>Price: ₹{label.price}</p>
            <p>
              Nutrition: Calories {label.nutrition?.calories}, Protein {label.nutrition?.protein}, Fat {label.nutrition?.fat}, Carbs {label.nutrition?.carbs}
            </p>
            <button onClick={() => deleteLabel(label._id)} style={{ color: "red", marginRight: 10 }}>Delete</button>
            <a href={`/branding/labels/edit/${label._id}`} style={{ color: "blue" }}>Edit</a>
          </div>
        ))}
      </div>

      <button
        onClick={handlePrint}
        style={{ marginTop: 20, background: "#111", color: "#fff", padding: 10, borderRadius: 6 }}
      >
        Print / PDF Export
      </button>
    </div>
  );
}
