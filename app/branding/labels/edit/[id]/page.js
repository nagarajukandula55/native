"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

export default function LabelEditor() {
  const router = useRouter();
  const { id } = useParams();

  const [label, setLabel] = useState(null);
  const [loading, setLoading] = useState(true);

  // Canvas elements
  const canvasRef = useRef(null);

  const [textElements, setTextElements] = useState([]);
  const [selectedText, setSelectedText] = useState(null);

  /* ================= FETCH LABEL ================= */
  useEffect(() => {
    const fetchLabel = async () => {
      try {
        const res = await axios.get("/api/branding/labels");
        const found = res.data.labels.find((l) => l._id === id);
        setLabel(found || null);
      } catch (err) {
        console.error("Fetch Label Error:", err);
      }
      setLoading(false);
    };
    fetchLabel();
  }, [id]);

  /* ================= TEXT ELEMENTS ================= */
  const addText = () => {
    const newText = { id: Date.now(), text: "New Text", x: 50, y: 50, fontSize: 20, color: "#000000" };
    setTextElements((prev) => [...prev, newText]);
    setSelectedText(newText.id);
  };

  const updateText = (key, value) => {
    setTextElements((prev) =>
      prev.map((el) => (el.id === selectedText ? { ...el, [key]: value } : el))
    );
  };

  const saveLabel = async () => {
    try {
      const updatedLabel = { ...label, design: textElements };
      await axios.put("/api/branding/labels", { id: label._id, ...updatedLabel });
      alert("Label Saved!");
      router.push("/branding/labels");
    } catch (err) {
      console.error("Save Label Error:", err);
    }
  };

  if (loading) return <p>Loading editor...</p>;
  if (!label) return <p>Label not found!</p>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* ================= SIDE PANEL ================= */}
      <div style={{ width: 300, padding: 20, borderRight: "1px solid #ddd" }}>
        <h2>Editor Tools</h2>
        <button onClick={addText} style={{ marginBottom: 10 }}>Add Text</button>

        {selectedText && (
          <div style={{ marginTop: 20 }}>
            <h4>Selected Text</h4>
            <input
              type="text"
              value={textElements.find(el => el.id === selectedText)?.text || ""}
              onChange={(e) => updateText("text", e.target.value)}
              placeholder="Text"
              style={{ width: "100%", marginBottom: 10 }}
            />
            <input
              type="number"
              value={textElements.find(el => el.id === selectedText)?.fontSize || 20}
              onChange={(e) => updateText("fontSize", parseInt(e.target.value))}
              placeholder="Font Size"
              style={{ width: "100%", marginBottom: 10 }}
            />
            <input
              type="color"
              value={textElements.find(el => el.id === selectedText)?.color || "#000000"}
              onChange={(e) => updateText("color", e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        )}

        <button onClick={saveLabel} style={{ marginTop: 20, background: "#2563eb", color: "#fff", padding: "8px 12px" }}>
          Save Design
        </button>
      </div>

      {/* ================= CANVAS ================= */}
      <div
        ref={canvasRef}
        style={{
          flex: 1,
          position: "relative",
          background: "#f9f9f9",
          overflow: "hidden",
        }}
      >
        {textElements.map((el) => (
          <div
            key={el.id}
            onClick={() => setSelectedText(el.id)}
            style={{
              position: "absolute",
              top: el.y,
              left: el.x,
              fontSize: el.fontSize,
              color: el.color,
              cursor: "move",
            }}
            draggable
            onDragEnd={(e) => {
              const rect = canvasRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              setTextElements((prev) =>
                prev.map((t) => (t.id === el.id ? { ...t, x, y } : t))
              );
            }}
          >
            {el.text}
          </div>
        ))}
      </div>
    </div>
  );
}
