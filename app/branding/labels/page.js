"use client";

import { useState } from "react";
import { Rnd } from "react-rnd";
import { v4 as uuidv4 } from "uuid";

export default function CanvaBuilder() {
  const [elements, setElements] = useState([]);
  const [selected, setSelected] = useState(null);

  /* ================= ADD ELEMENTS ================= */

  const addText = () => {
    setElements(prev => [
      ...prev,
      {
        id: uuidv4(),
        type: "text",
        text: "Edit Text",
        x: 100,
        y: 100,
        width: 150,
        height: 40,
        fontSize: 20,
        color: "#000",
      },
    ]);
  };

  const addShape = () => {
    setElements(prev => [
      ...prev,
      {
        id: uuidv4(),
        type: "shape",
        x: 120,
        y: 120,
        width: 100,
        height: 100,
        color: "#3b2415",
      },
    ]);
  };

  const addImage = () => {
    setElements(prev => [
      ...prev,
      {
        id: uuidv4(),
        type: "image",
        src: "/logo.png",
        x: 150,
        y: 150,
        width: 120,
        height: 80,
      },
    ]);
  };

  /* ================= UPDATE ================= */

  const updateElement = (id, newProps) => {
    setElements(prev =>
      prev.map(el => (el.id === id ? { ...el, ...newProps } : el))
    );
  };

  const deleteElement = () => {
    setElements(prev => prev.filter(el => el.id !== selected));
    setSelected(null);
  };

  const selectedEl = elements.find(el => el.id === selected);

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* ================= LEFT TOOLBAR ================= */}
      <div style={sidebar}>
        <h3>Tools</h3>
        <button onClick={addText}>Add Text</button>
        <button onClick={addImage}>Add Image</button>
        <button onClick={addShape}>Add Shape</button>
      </div>

      {/* ================= CANVAS ================= */}
      <div style={canvas}>
        {elements.map(el => (
          <Rnd
            key={el.id}
            size={{ width: el.width, height: el.height }}
            position={{ x: el.x, y: el.y }}
            onDragStop={(e, d) =>
              updateElement(el.id, { x: d.x, y: d.y })
            }
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateElement(el.id, {
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                ...pos,
              })
            }
            onClick={() => setSelected(el.id)}
            style={{
              border: selected === el.id ? "2px solid blue" : "none",
            }}
          >
            {el.type === "text" && (
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  updateElement(el.id, { text: e.target.innerText })
                }
                style={{
                  width: "100%",
                  height: "100%",
                  fontSize: el.fontSize,
                  color: el.color,
                  cursor: "move",
                }}
              >
                {el.text}
              </div>
            )}

            {el.type === "image" && (
              <img
                src={el.src}
                style={{ width: "100%", height: "100%" }}
              />
            )}

            {el.type === "shape" && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: el.color,
                }}
              />
            )}
          </Rnd>
        ))}
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div style={rightPanel}>
        <h3>Properties</h3>

        {selectedEl ? (
          <>
            {selectedEl.type === "text" && (
              <>
                <input
                  type="number"
                  value={selectedEl.fontSize}
                  onChange={(e) =>
                    updateElement(selectedEl.id, {
                      fontSize: Number(e.target.value),
                    })
                  }
                />

                <input
                  type="color"
                  value={selectedEl.color}
                  onChange={(e) =>
                    updateElement(selectedEl.id, {
                      color: e.target.value,
                    })
                  }
                />
              </>
            )}

            {(selectedEl.type === "shape") && (
              <input
                type="color"
                value={selectedEl.color}
                onChange={(e) =>
                  updateElement(selectedEl.id, {
                    color: e.target.value,
                  })
                }
              />
            )}

            <button onClick={deleteElement}>Delete</button>
          </>
        ) : (
          <p>Select element</p>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const sidebar = {
  width: 200,
  background: "#111",
  color: "#fff",
  padding: 10,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const canvas = {
  flex: 1,
  background: "#f5f5f5",
  position: "relative",
};

const rightPanel = {
  width: 220,
  background: "#eee",
  padding: 10,
};
