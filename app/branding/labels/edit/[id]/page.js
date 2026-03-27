"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

export default function LabelEditor() {
  const router = useRouter();
  const { id } = useParams();

  const [label, setLabel] = useState(null);
  const [loading, setLoading] = useState(true);

  const canvasRef = useRef(null);

  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState("front"); // front/back toggle

  /* ================= FETCH LABEL ================= */
  useEffect(() => {
    const fetchLabel = async () => {
      try {
        const res = await axios.get("/api/branding/labels");
        const found = res.data.labels.find((l) => l._id === id);
        setLabel(found || null);
        setElements(found?.design || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchLabel();
  }, [id]);

  /* ================= ELEMENT FUNCTIONS ================= */
  const addText = () => {
    const newText = {
      id: Date.now(),
      type: "text",
      text: "New Text",
      x: 50,
      y: 50,
      fontSize: 20,
      color: "#000",
      fontFamily: "Arial",
      view: "front",
    };
    setElements((prev) => [...prev, newText]);
    setSelectedId(newText.id);
  };

  const addImage = (url) => {
    const newImage = {
      id: Date.now(),
      type: "image",
      src: url,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      view: "front",
    };
    setElements((prev) => [...prev, newImage]);
    setSelectedId(newImage.id);
  };

  const updateElement = (key, value) => {
    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, [key]: value } : el))
    );
  };

  const saveLabel = async () => {
    try {
      const updatedLabel = { ...label, design: elements };
      await axios.put("/api/branding/labels", { id: label._id, ...updatedLabel });
      alert("Label saved!");
      router.push("/branding/labels");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading editor...</p>;
  if (!label) return <p>Label not found!</p>;

  /* ================= SIDE PANEL ================= */
  const selectedElement = elements.find((el) => el.id === selectedId);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: 300, padding: 20, borderRight: "1px solid #ddd", overflowY: "auto" }}>
        <h2>Tools</h2>
        <button onClick={addText} style={{ marginBottom: 10 }}>Add Text</button>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files[0] && addImage(URL.createObjectURL(e.target.files[0]))}
          style={{ marginBottom: 10 }}
        />

        <div>
          <button onClick={() => setView("front")} disabled={view === "front"}>Front</button>
          <button onClick={() => setView("back")} disabled={view === "back"}>Back</button>
        </div>

        {selectedElement && (
          <div style={{ marginTop: 20 }}>
            <h4>Selected Element</h4>
            {selectedElement.type === "text" && (
              <>
                <input
                  type="text"
                  value={selectedElement.text}
                  onChange={(e) => updateElement("text", e.target.value)}
                  style={{ width: "100%", marginBottom: 10 }}
                />
                <input
                  type="number"
                  value={selectedElement.fontSize}
                  onChange={(e) => updateElement("fontSize", parseInt(e.target.value))}
                  style={{ width: "100%", marginBottom: 10 }}
                />
                <input
                  type="color"
                  value={selectedElement.color}
                  onChange={(e) => updateElement("color", e.target.value)}
                  style={{ width: "100%", marginBottom: 10 }}
                />
                <input
                  type="text"
                  value={selectedElement.fontFamily}
                  onChange={(e) => updateElement("fontFamily", e.target.value)}
                  style={{ width: "100%", marginBottom: 10 }}
                />
              </>
            )}
            {selectedElement.type === "image" && (
              <>
                <input
                  type="number"
                  value={selectedElement.width}
                  onChange={(e) => updateElement("width", parseInt(e.target.value))}
                  style={{ width: "100%", marginBottom: 10 }}
                />
                <input
                  type="number"
                  value={selectedElement.height}
                  onChange={(e) => updateElement("height", parseInt(e.target.value))}
                  style={{ width: "100%", marginBottom: 10 }}
                />
              </>
            )}
          </div>
        )}

        <button
          onClick={saveLabel}
          style={{ marginTop: 20, background: "#2563eb", color: "#fff", padding: "8px 12px", width: "100%" }}
        >
          Save Label
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
        {elements
          .filter((el) => el.view === view)
          .map((el) =>
            el.type === "text" ? (
              <div
                key={el.id}
                onClick={() => setSelectedId(el.id)}
                style={{
                  position: "absolute",
                  top: el.y,
                  left: el.x,
                  fontSize: el.fontSize,
                  color: el.color,
                  fontFamily: el.fontFamily,
                  cursor: "move",
                }}
                draggable
                onDragEnd={(e) => {
                  const rect = canvasRef.current.getBoundingClientRect();
                  updateElement("x", e.clientX - rect.left);
                  updateElement("y", e.clientY - rect.top);
                }}
              >
                {el.text}
              </div>
            ) : (
              <img
                key={el.id}
                src={el.src}
                alt="img"
                style={{
                  position: "absolute",
                  top: el.y,
                  left: el.x,
                  width: el.width,
                  height: el.height,
                  cursor: "move",
                }}
                onClick={() => setSelectedId(el.id)}
                draggable
                onDragEnd={(e) => {
                  const rect = canvasRef.current.getBoundingClientRect();
                  updateElement("x", e.clientX - rect.left);
                  updateElement("y", e.clientY - rect.top);
                }}
              />
            )
          )}
      </div>
    </div>
  );
}
