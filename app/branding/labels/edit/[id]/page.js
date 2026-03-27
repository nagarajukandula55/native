"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

/* ====== Label Editor ====== */
export default function LabelEditor() {
  const { id } = useParams();
  const router = useRouter();
  const [label, setLabel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState(null);

  /* ================= FETCH LABEL ================= */
  useEffect(() => {
    const fetchLabel = async () => {
      try {
        const res = await axios.get(`/api/branding/labels/${id}`);
        setLabel(res.data.label);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchLabel();
  }, [id]);

  /* ================= UPDATE ELEMENT ================= */
  const updateElement = (elId, updates) => {
    setLabel((prev) => ({
      ...prev,
      design: prev.design.map((el) => (el.id === elId ? { ...el, ...updates } : el)),
    }));
  };

  /* ================= ADD TEXT ================= */
  const addText = () => {
    const newEl = {
      id: Date.now(),
      type: "text",
      text: "New Text",
      x: 50,
      y: 50,
      fontSize: 16,
      color: "#000000",
      fontFamily: "Arial",
      view: "front",
    };
    setLabel((prev) => ({ ...prev, design: [...prev.design, newEl] }));
  };

  /* ================= SAVE LABEL ================= */
  const saveLabel = async () => {
    try {
      await axios.put(`/api/branding/labels/${id}`, label);
      alert("Label saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving label");
    }
  };

  if (loading) return <p>Loading editor...</p>;
  if (!label) return <p>Label not found!</p>;

  return (
    <div style={{ display: "flex", padding: 20, gap: 20 }}>
      {/* ================= CANVAS ================= */}
      <div style={{ flex: 3, border: "1px solid #ccc", position: "relative", height: 500, background: "#fff" }}>
        {label.design.map((el) => (
          <div
            key={el.id}
            onClick={() => setSelectedElement(el)}
            style={{
              position: "absolute",
              top: el.y,
              left: el.x,
              fontSize: el.fontSize,
              color: el.color,
              fontFamily: el.fontFamily,
              cursor: "pointer",
              border: selectedElement?.id === el.id ? "1px dashed #2563eb" : "none",
              padding: 2,
            }}
          >
            {el.text}
          </div>
        ))}
      </div>

      {/* ================= CONTROLS ================= */}
      <div style={{ flex: 1 }}>
        <h3>Controls</h3>
        <button onClick={addText} style={btnStyle}>Add Text</button>
        {selectedElement && (
          <div style={{ marginTop: 20 }}>
            <h4>Edit Element</h4>
            <label>Text:</label>
            <input
              type="text"
              value={selectedElement.text}
              onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
              style={inputStyle}
            />
            <label>Font Size:</label>
            <input
              type="number"
              value={selectedElement.fontSize}
              onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
              style={inputStyle}
            />
            <label>Color:</label>
            <input
              type="color"
              value={selectedElement.color}
              onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
              style={inputStyle}
            />
            <label>Font Family:</label>
            <select
              value={selectedElement.fontFamily}
              onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
              style={inputStyle}
            >
              <option>Arial</option>
              <option>Georgia</option>
              <option>Times New Roman</option>
              <option>Courier New</option>
            </select>
          </div>
        )}

        <button onClick={saveLabel} style={{ ...btnStyle, marginTop: 20 }}>Save Label</button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const btnStyle = {
  padding: "8px 12px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  marginBottom: 10,
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginBottom: 10,
  padding: 6,
};
