"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Rnd } from "react-rnd"; // ✅ Drag & Resize
import html2canvas from "html2canvas"; // ✅ Export PNG
import jsPDF from "jspdf"; // ✅ Export PDF

export default function LabelEditor() {
  const { id } = useParams();
  const [label, setLabel] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [templates] = useState([
    { id: 1, name: "Minimal", design: [{ type: "text", text: "Brand Name", x: 50, y: 50, fontSize: 20, color: "#000", fontFamily: "Arial", width: 150, height: 50, view: "front", id: uuidv4() }] },
    { id: 2, name: "Classic", design: [{ type: "text", text: "Classic Label", x: 50, y: 50, fontSize: 24, color: "#111", fontFamily: "Georgia", width: 200, height: 60, view: "front", id: uuidv4() }] },
  ]);

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

  const addElement = (type) => {
    const newEl = {
      id: uuidv4(),
      type,
      text: type === "text" ? "New Text" : "",
      src: type === "image" ? "/logo-placeholder.png" : "",
      x: 50,
      y: 50,
      fontSize: 16,
      color: "#000",
      fontFamily: "Arial",
      width: 100,
      height: 50,
      view: "front",
    };
    setLabel((prev) => ({ ...prev, design: [...prev.design, newEl] }));
  };

  const updateElement = (elId, updates) => {
    setLabel((prev) => ({
      ...prev,
      design: prev.design.map((el) => (el.id === elId ? { ...el, ...updates } : el)),
    }));
  };

  const removeElement = (elId) => {
    setLabel((prev) => ({ ...prev, design: prev.design.filter((el) => el.id !== elId) }));
    setSelectedElement(null);
  };

  const toggleView = (view) => {
    setLabel((prev) => ({ ...prev, currentView: view }));
    setSelectedElement(null);
  };

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

  const applyTemplate = (template) => {
    setLabel((prev) => ({ ...prev, design: template.design }));
  };

  const saveLabel = async () => {
    try {
      await axios.put(`/api/branding/labels/${id}`, label);
      alert("Label saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving label");
    }
  };

  const exportAsPNG = async () => {
    const canvas = await html2canvas(document.getElementById("label-canvas"));
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${label.name || "label"}.png`;
    link.click();
  };

  const exportAsPDF = async () => {
    const canvas = await html2canvas(document.getElementById("label-canvas"));
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 180, 160);
    pdf.save(`${label.name || "label"}.pdf`);
  };

  if (loading) return <p>Loading editor...</p>;
  if (!label) return <p>Label not found!</p>;

  return (
    <div style={{ display: "flex", padding: 20, gap: 20 }}>
      {/* ================= CANVAS ================= */}
      <div id="label-canvas" style={{ flex: 3, border: "1px solid #ccc", height: 500, background: "#fff", position: "relative" }}>
        {label.design
          .filter((el) => el.view === label.currentView)
          .map((el) => (
            <Rnd
              key={el.id}
              size={{ width: el.width, height: el.height }}
              position={{ x: el.x, y: el.y }}
              onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
              onResizeStop={(e, direction, ref, delta, position) => {
                updateElement(el.id, { width: ref.offsetWidth, height: ref.offsetHeight, ...position });
              }}
              bounds="parent"
            >
              {el.type === "text" ? (
                <div
                  onClick={() => setSelectedElement(el)}
                  style={{ fontSize: el.fontSize, color: el.color, fontFamily: el.fontFamily, width: "100%", height: "100%" }}
                >
                  {el.text}
                </div>
              ) : (
                <img
                  onClick={() => setSelectedElement(el)}
                  src={el.src}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              )}
            </Rnd>
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
          <h4>Templates</h4>
          {templates.map((t) => (
            <button key={t.id} onClick={() => applyTemplate(t)} style={btnStyle}>{t.name}</button>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <h4>Front/Back</h4>
          <button onClick={() => toggleView("front")} style={btnStyle}>Front</button>
          <button onClick={() => toggleView("back")} style={btnStyle}>Back</button>
        </div>

        {selectedElement && selectedElement.type === "text" && (
          <div style={{ marginTop: 20 }}>
            <h4>Edit Text</h4>
            <input type="text" value={selectedElement.text} onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })} style={inputStyle} />
            <input type="number" value={selectedElement.fontSize} onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })} style={inputStyle} />
            <input type="color" value={selectedElement.color} onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })} style={inputStyle} />
            <button onClick={() => removeElement(selectedElement.id)} style={{ ...btnStyle, background: "red" }}>Delete Element</button>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <button onClick={saveLabel} style={btnStyle}>Save Label</button>
          <button onClick={exportAsPNG} style={btnStyle}>Export PNG</button>
          <button onClick={exportAsPDF} style={btnStyle}>Export PDF</button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = { padding: "8px 12px", margin: "5px 0", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" };
const inputStyle = { display: "block", width: "100%", marginBottom: 10, padding: 6 };
