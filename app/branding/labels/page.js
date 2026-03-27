"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LabelsPage() {
  const router = useRouter();
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH LABELS ================= */
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const res = await axios.get("/api/branding/labels");
        setLabels(res.data.labels || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchLabels();
  }, []);

  /* ================= CREATE NEW LABEL ================= */
  const createLabel = async (template = null) => {
    try {
      const res = await axios.post("/api/branding/labels", {
        name: template?.name || "New Label",
        design: template?.design || [],
      });
      router.push(`/branding/labels/edit/${res.data.label._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading labels...</p>;

  /* ================= LABEL TEMPLATES ================= */
  const templates = [
    {
      name: "Classic White",
      design: [
        { id: 1, type: "text", text: "Brand Name", x: 50, y: 50, fontSize: 24, color: "#000", fontFamily: "Arial", view: "front" },
        { id: 2, type: "text", text: "Ingredients", x: 50, y: 100, fontSize: 14, color: "#333", fontFamily: "Arial", view: "front" },
      ],
    },
    {
      name: "Eco Green",
      design: [
        { id: 1, type: "text", text: "Eco Brand", x: 50, y: 50, fontSize: 24, color: "#1B5E20", fontFamily: "Georgia", view: "front" },
        { id: 2, type: "text", text: "Organic Ingredients", x: 50, y: 100, fontSize: 14, color: "#2E7D32", fontFamily: "Georgia", view: "front" },
      ],
    },
    {
      name: "Premium Gold",
      design: [
        { id: 1, type: "text", text: "Luxury Brand", x: 50, y: 50, fontSize: 24, color: "#FFD700", fontFamily: "Times New Roman", view: "front" },
        { id: 2, type: "text", text: "High Quality Ingredients", x: 50, y: 100, fontSize: 14, color: "#FFA000", fontFamily: "Times New Roman", view: "front" },
      ],
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h1>Labels</h1>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => createLabel()}
          style={{ marginRight: 10, padding: "8px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4 }}
        >
          Create Blank Label
        </button>
        <span style={{ fontSize: 14, color: "#555" }}>Or select a template:</span>
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 40 }}>
        {templates.map((tpl, i) => (
          <div key={i} style={{ border: "1px solid #ddd", padding: 10, width: 200, cursor: "pointer" }} onClick={() => createLabel(tpl)}>
            <h4>{tpl.name}</h4>
            <div style={{ border: "1px solid #ccc", height: 100, background: "#f9f9f9", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              {tpl.design.map((el) => el.type === "text" && (
                <span key={el.id} style={{ fontSize: el.fontSize, color: el.color, fontFamily: el.fontFamily }}>
                  {el.text}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {labels.map((label) => (
          <div
            key={label._id}
            style={{ border: "1px solid #ddd", padding: 10, cursor: "pointer" }}
            onClick={() => router.push(`/branding/labels/edit/${label._id}`)}
          >
            <h4>{label.name}</h4>
            <div style={{ height: 80, background: "#f9f9f9", border: "1px solid #ccc" }}>
              {/* Placeholder preview */}
              {label.design?.map((el) => el.type === "text" && (
                <span key={el.id} style={{ fontSize: el.fontSize, color: el.color, fontFamily: el.fontFamily, marginRight: 5 }}>
                  {el.text}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
