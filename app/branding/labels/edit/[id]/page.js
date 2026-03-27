"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export default function LabelEditor() {
  const { id } = useParams();
  const [label, setLabel] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

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

  /* ================= ADD ELEMENT ================= */
  const addElement = (type) => {
    const newEl = {
      id: uuidv4(),
      type,
      text: type === "text" ? "New Text" : "",
      src: type === "image" ? "/logo-placeholder.png" : "",
      x: 50,
      y: 50,
      fontSize: 16,
      color: "#000000",
      fontFamily: "Arial",
      width: 100,
      height: 50,
      view: "front",
    };
    setLabel((prev) => ({ ...prev, design: [...prev.design, newEl] }));
  };

  /* ================= UPDATE ELEMENT ================= */
  const updateElement = (elId, updates) => {
    setLabel((prev) => ({
      ...prev,
      design: prev.design.map((el) => (el.id === elId ? { ...el, ...updates } : el)),
    }));
  };

  /* ================= REMOVE ELEMENT ================= */
  const removeElement = (elId) => {
    setLabel((prev) => ({
      ...prev,
      design: prev.design.filter((el) => el.id !== elId),
    }));
    setSelectedElement(null);
  };

  /* ================= TOGGLE FRONT/BACK ================= */
  const toggleView = (view) => {
    setLabel((prev) => ({ ...prev, currentView: view }));
    setSelectedElement(null);
  };

  /* ================= AI TEXT GENERATION ================= */
  const generateAIText = async (type) => {
    try {
      const res = await axios.post("/api/branding/labels/ai", { type });
      addElement("text");
      updateElement(label.design[label.design.length - 1]?.id, { text: res.data.text });
    } catch (err) {
      console.error(err);
      alert("AI generation failed");
    }
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
      <div
        ref={canvasRef}
        style={{
          flex: 3,
          border: "1px solid #ccc",
          height: 500,
          background: "#fff",
          position: "relative",
        }}
      >
        {label.design
          .filter((el) => el.view === label.currentView)
          .map((el) => (
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
                width: el.width,
                height: el.height,
                border: selectedElement?.id === el.id ? "1px dashed #2563eb" : "none",
                cursor: "pointer",
                background: el.type === "image" ? `url(${el.src}) center/contain no-repeat` : "transparent",
                padding: el.type === "text" ? 2 : 0,
              }}
            >
              {el.type === "text" ? el.text : null}
            </div>
          ))}
      </div>

      {/* ================= CONTROLS ================= */}
      <div style={{ flex: 1 }}>
        <h3>Controls</h3>

        <button onClick={() => addElement("text")} style={btnStyle}>Add Text</button>
        <button onClick={() => addElement("image")} style={btnStyle}>Add Image/Logo</button>
        <button onClick={() => generateAIText("ingredients")} style={btnStyle}>AI Ingredients</button>
        <button onClick={() => generateAIText("slogan")} style={btnStyle}>AI Slogan</button>

        <div style={{ marginTop: 20 }}>
          <h4>Front/Back</h4>
          <button onClick={() => toggleView("front")} style={btnStyle}>Front</button>
          <button onClick={() => toggleView("back")} style={btnStyle}>Back</button>
        </div>

        {selectedElement && (
          <div style={{ marginTop: 20 }}>
            <h4>Edit Element</h4>
            {selectedElement.type === "text" && (
              <>
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
              </>
            )}
            <button onClick={() => removeElement(selectedElement.id)} style={{ ...btnStyle, background: "red" }}>Delete Element</button>
          </div>
        )}

        <button onClick={saveLabel} style={{ ...btnStyle, marginTop: 20 }}>Save Label</button>
      </div>
    </div>
  );
}

const btnStyle = { padding: "8px 12px", margin: "5px 0", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" };
const inputStyle = { display: "block", width: "100%", marginBottom: 10, padding: 6 };
