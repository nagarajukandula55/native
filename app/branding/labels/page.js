"use client";

import { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { v4 as uuidv4 } from "uuid";

// Preloaded templates
const templates = [
  { id: 1, name: "Classic", bg: "#fff", color: "#000" },
  { id: 2, name: "Minimal", bg: "#f5f5f5", color: "#333" },
  { id: 3, name: "Bold", bg: "#000", color: "#fff" },
];

export default function LabelsPage() {
  const [elements, setElements] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [activeSide, setActiveSide] = useState("front"); // front/back
  const [frontElements, setFrontElements] = useState([]);
  const [backElements, setBackElements] = useState([]);

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
    setElements([...elements, newEl]);
    if (activeSide === "front") setFrontElements([...frontElements, newEl]);
    else setBackElements([...backElements, newEl]);
  };

  /* ================= UPDATE ELEMENT ================= */
  const updateElement = (id, newProps) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...newProps } : el));
    if (activeSide === "front") setFrontElements(elements);
    else setBackElements(elements);
  };

  /* ================= DELETE ELEMENT ================= */
  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    if (activeSide === "front")
      setFrontElements(frontElements.filter(el => el.id !== id));
    else
      setBackElements(backElements.filter(el => el.id !== id));
  };

  /* ================= SWITCH SIDE ================= */
  const switchSide = (side) => {
    setActiveSide(side);
    setElements(side === "front" ? frontElements : backElements);
  };

  /* ================= EXPORT ================= */
  const exportLabel = async (format = "png") => {
    const labelDiv = document.getElementById("label-canvas");
    const canvas = await html2canvas(labelDiv, { scale: 2 });
    if (format === "png") {
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
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
            style={{
              padding: 10,
              marginBottom: 10,
              cursor: "pointer",
              border: selectedTemplate.id === tpl.id ? "2px solid #2563eb" : "1px solid #ccc",
              background: tpl.bg,
              color: tpl.color,
            }}
            onClick={() => setSelectedTemplate(tpl)}
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
          background: selectedTemplate.bg,
          color: selectedTemplate.color,
        }}
      >
        {elements.map((el) => (
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
