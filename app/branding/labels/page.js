"use client";

import { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd"; // Drag & resize
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Example templates
const TEMPLATES = [
  {
    id: 1,
    name: "Classic Label",
    width: 400,
    height: 250,
    elements: [
      { id: "title", type: "text", text: "Product Name", x: 50, y: 20, fontSize: 24, color: "#000" },
      { id: "subtitle", type: "text", text: "Subtitle / Tagline", x: 50, y: 60, fontSize: 16, color: "#333" },
      { id: "logo", type: "image", src: "/logo.png", x: 300, y: 20, width: 80, height: 80 },
    ],
  },
  {
    id: 2,
    name: "Modern Label",
    width: 400,
    height: 250,
    elements: [
      { id: "title", type: "text", text: "Brand Name", x: 50, y: 30, fontSize: 26, color: "#111" },
      { id: "subtitle", type: "text", text: "Organic & Fresh", x: 50, y: 70, fontSize: 14, color: "#555" },
      { id: "image", type: "image", src: "/sample-product.png", x: 250, y: 50, width: 120, height: 120 },
    ],
  },
];

export default function LabelsPage() {
  const [canvasElements, setCanvasElements] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [side, setSide] = useState("front"); // front/back toggle
  const canvasRef = useRef();

  // Load template
  const loadTemplate = (templateId) => {
    const temp = TEMPLATES.find((t) => t.id === templateId);
    if (!temp) return;
    setSelectedTemplate(temp);
    setCanvasElements(temp.elements.map((e) => ({ ...e })));
  };

  // Update element properties
  const updateElement = (id, newProps) => {
    setCanvasElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...newProps } : el))
    );
  };

  // Export canvas
  const exportPNG = async () => {
    if (!canvasRef.current) return;
    const canvas = await html2canvas(canvasRef.current);
    const dataURL = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.download = `label_${side}.png`;
    link.href = dataURL;
    link.click();
  };

  const exportPDF = async () => {
    if (!canvasRef.current) return;
    const canvas = await html2canvas(canvasRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`label_${side}.pdf`);
  };

  // AI generate placeholder (replace with real API later)
  const generateAIText = (elementId) => {
    const sampleTexts = [
      "Fresh & Organic",
      "100% Natural",
      "Premium Quality",
      "Delicious Taste",
    ];
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    updateElement(elementId, { text: randomText });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Branding Labels</h1>

      {/* TEMPLATE SELECTION */}
      <div style={{ marginBottom: 20 }}>
        <h3>Choose a Template:</h3>
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => loadTemplate(t.id)}
            style={{
              marginRight: 10,
              padding: 8,
              background: selectedTemplate?.id === t.id ? "#2563eb" : "#eee",
              color: selectedTemplate?.id === t.id ? "#fff" : "#000",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* FRONT/BACK TOGGLE */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setSide("front")}
          style={{
            padding: 8,
            marginRight: 10,
            background: side === "front" ? "#2563eb" : "#eee",
            color: side === "front" ? "#fff" : "#000",
            border: "none",
            cursor: "pointer",
          }}
        >
          Front
        </button>
        <button
          onClick={() => setSide("back")}
          style={{
            padding: 8,
            background: side === "back" ? "#2563eb" : "#eee",
            color: side === "back" ? "#fff" : "#000",
            border: "none",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>

      {/* CANVAS */}
      <div
        ref={canvasRef}
        style={{
          width: selectedTemplate?.width || 400,
          height: selectedTemplate?.height || 250,
          border: "2px dashed #ccc",
          position: "relative",
          marginBottom: 20,
          background: "#fff",
        }}
      >
        {canvasElements.map((el) =>
          el.type === "text" ? (
            <Rnd
              key={el.id}
              size={{ width: el.text.length * 10 + 20, height: el.fontSize + 10 }}
              position={{ x: el.x, y: el.y }}
              onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
              onResizeStop={(e, direction, ref, delta, position) => {
                updateElement(el.id, { x: position.x, y: position.y });
              }}
            >
              <div
                style={{
                  fontSize: el.fontSize,
                  color: el.color,
                  cursor: "move",
                  userSelect: "none",
                }}
                onDoubleClick={() => generateAIText(el.id)}
              >
                {el.text}
              </div>
            </Rnd>
          ) : (
            <Rnd
              key={el.id}
              size={{ width: el.width, height: el.height }}
              position={{ x: el.x, y: el.y }}
              onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
              onResizeStop={(e, direction, ref, delta, position) => {
                updateElement(el.id, {
                  x: position.x,
                  y: position.y,
                  width: ref.offsetWidth,
                  height: ref.offsetHeight,
                });
              }}
            >
              <img
                src={el.src}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Rnd>
          )
        )}
      </div>

      {/* EXPORT BUTTONS */}
      <div>
        <button
          onClick={exportPNG}
          style={{ padding: 10, marginRight: 10, cursor: "pointer" }}
        >
          Export PNG
        </button>
        <button
          onClick={exportPDF}
          style={{ padding: 10, cursor: "pointer" }}
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}
