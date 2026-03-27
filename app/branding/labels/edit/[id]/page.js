"use client";

import { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function EditLabelPage({ params }) {
  const { id } = params;
  const router = useRouter();

  const [label, setLabel] = useState(null);
  const [elements, setElements] = useState([]);

  /* ===== FETCH LABEL ===== */
  useEffect(() => {
    const fetchLabel = async () => {
      const res = await fetch(`/api/branding/labels/${id}`);
      const data = await res.json();
      if (data.success) {
        setLabel(data.label);
        setElements(data.label.elements || []);
      }
    };
    fetchLabel();
  }, [id]);

  if (!label) return <p>Loading...</p>;

  /* ===== ADD NEW ELEMENT ===== */
  const addTextElement = () => {
    setElements(prev => [
      ...prev,
      {
        id: uuidv4(),
        type: "text",
        text: "New Text",
        x: 50,
        y: 50,
        width: 150,
        height: 30,
        fontSize: 16,
        color: "#000",
      },
    ]);
  };

  const addImageElement = () => {
    setElements(prev => [
      ...prev,
      {
        id: uuidv4(),
        type: "image",
        src: "/logo.png",
        x: 50,
        y: 50,
        width: 100,
        height: 50,
      },
    ]);
  };

  /* ===== UPDATE ELEMENT ===== */
  const updateElement = (id, newProps) => {
    setElements(prev =>
      prev.map(el => (el.id === id ? { ...el, ...newProps } : el))
    );
  };

  /* ===== SAVE LABEL ===== */
  const saveLabel = async () => {
    const res = await fetch(`/api/branding/labels/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ elements }),
    });
    const data = await res.json();
    if (data.success) alert("Label saved!");
    else alert(data.msg || "Error saving label");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Edit Label: {label.name}</h1>

      <div style={{ marginBottom: 10 }}>
        <button onClick={addTextElement} style={btnStyle}>Add Text</button>
        <button onClick={addImageElement} style={{ ...btnStyle, marginLeft: 10 }}>Add Image</button>
        <button onClick={saveLabel} style={{ ...btnStyle, marginLeft: 10 }}>Save Label</button>
      </div>

      {/* ===== CANVAS / EDIT AREA ===== */}
      <div style={{
        width: 600,
        height: 400,
        border: "1px solid #ccc",
        position: "relative",
        background: "#fff"
      }}>
        {elements.map(el => (
          <Rnd
            key={el.id}
            size={{ width: el.width, height: el.height }}
            position={{ x: el.x, y: el.y }}
            onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
            onResizeStop={(e, dir, ref, delta, position) =>
              updateElement(el.id, {
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                ...position,
              })
            }
          >
            {el.type === "text" ? (
              <input
                value={el.text}
                onChange={e => updateElement(el.id, { text: e.target.value })}
                style={{
                  width: "100%",
                  height: "100%",
                  fontSize: el.fontSize,
                  color: el.color,
                  border: "1px dashed #333",
                  background: "transparent"
                }}
              />
            ) : (
              <img src={el.src} style={{ width: "100%", height: "100%" }} />
            )}
          </Rnd>
        ))}
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "6px 12px",
  cursor: "pointer",
  marginBottom: 5,
};
