"use client";

import { useState } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { v4 as uuidv4 } from "uuid";

// Sample Templates
const templates = [
  { id: 1, name: "Classic", bg: "#fff", color: "#000" },
  { id: 2, name: "Minimal", bg: "#f5f5f5", color: "#333" },
  { id: 3, name: "Bold", bg: "#000", color: "#fff" },
];

export default function LabelsPage() {
  const [activeTemplate, setActiveTemplate] = useState(templates[0]);
  const [activeSide, setActiveSide] = useState("front");
  const [frontElements, setFrontElements] = useState([]);
  const [backElements, setBackElements] = useState([]);
  const [elements, setElements] = useState([]);

  /* ================= SWITCH SIDE ================= */
  const switchSide = (side) => {
    setActiveSide(side);
    setElements(side === "front" ? frontElements : backElements);
  };

  /* ================= ADD ELEMENT ================= */
  const addElement = (type) => {
    const newEl = {
      id: uuidv4(),
      type,
      text: type === "text" ? "New Text" : "",
      x: 50,
      y: 50,
      width: 120,
      height: 40,
      fontSize: 16,
      color: "#000",
    };
    const updated = [...elements, newEl];
    setElements(updated);
    if (activeSide === "front") setFrontElements(updated);
    else setBackElements(updated);
  };

  /* ================= UPDATE ELEMENT ================= */
  const updateElement = (id, newProps) => {
    const updated = elements.map(el => el.id === id ? { ...el, ...newProps } : el);
    setElements(updated);
    if (activeSide === "front") setFrontElements(updated);
    else setBackElements(updated);
  };

  /* ================= DELETE ELEMENT ================= */
  const deleteElement = (id) => {
    const updated = elements.filter(el => el.id !== id);
    setElements(updated);
    if (activeSide === "front") setFrontElements(updated);
    else setBackElements(updated);
  };

  /* ================= EXPORT ================= */
  const exportLabel = async (format = "png") => {
    const labelDiv = document.getElementById("label-canvas");
    const canvas = await html2canvas(labelDiv, { scale: 2 });
    if (format === "png") {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `label-${activeSide}.png`;
      link.click();
    } else if (format === "pdf") {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`label-${activeSide}.pdf`);
    }
  };

  return (
    <div style={{ display: "flex", padding: 20, gap: 20 }}>
      {/* ================= SIDEBAR ================= */}
      <div style={{ width: 250 }}>
        <h2>Templates</h2>
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => setActiveTemplate(tpl)}
            style={{
              padding: 10,
              marginBottom: 10,
              cursor: "pointer",
              border: tpl.id === activeTemplate.id ? "2px solid #2563eb" : "1px solid #ccc",
              background: tpl.bg,
              color: tpl.color,
            }}
          >
            {tpl.name}
          </div>
        ))}

        <h2>Actions</h2>
        <button onClick={() => addElement("text")} style={{ width: "100%", marginBottom: 10 }}>Add Text</button>
        <button onClick={() => addElement("image")} style={{ width: "100%", marginBottom: 10 }}>Add Image</button>
        <button onClick={() => exportLabel("png")} style={{ width: "100%", marginBottom: 10 }}>Export PNG</button>
        <button onClick={() => exportLabel("pdf")} style={{ width: "100%" }}>Export PDF</button>

        <h2>Sides</h2>
        <button onClick={() => switchSide("front")} style={{ width: "100%", marginBottom: 5 }}>Front</button>
        <button onClick={() => switchSide("back")} style={{ width: "100%" }}>Back</button>
      </div>

      {/* ================= LABEL CANVAS ================= */}
      <div
        id="label-canvas"
        style={{
          width: 400,
          height: 400,
          border: "1px solid #ccc",
          position: "relative",
          background: activeTemplate.bg,
          color: activeTemplate.color,
        }}
      >
        {elements.map(el => (
          <Rnd
            key={el.id}
            bounds="parent"
            size={{ width: el.width, height: el.height }}
            position={{ x: el.x, y: el.y }}
            onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
            onResizeStop={(e, direction, ref, delta, position) =>
              updateElement(el.id, {
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                ...position,
              })
            }
            style={{
              border: "1px dashed #999",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: el.type === "text" ? "transparent" : "#ddd",
              cursor: "move",
            }}
          >
            {el.type === "text" ? (
              <input
                type="text"
                value={el.text}
                onChange={(e) => updateElement(el.id, { text: e.target.value })}
                style={{ width: "100%", border: "none", background: "transparent", textAlign: "center" }}
              />
            ) : (
              <span>Image</span>
            )}
            <button
              onClick={() => deleteElement(el.id)}
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                background: "red",
                color: "#fff",
                borderRadius: "50%",
                border: "none",
                width: 20,
                height: 20,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </Rnd>
        ))}
      </div>
    </div>
  );
}
