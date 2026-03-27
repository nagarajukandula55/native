"use client";

import { useState } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import * as Icons from "react-icons/fa";
import { templates } from "@/lib/templates";

/* LIMIT INITIAL LOAD */
const iconKeys = Object.keys(Icons).slice(0, 100);

export default function Editor() {
  const [elements, setElements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  /* ===== HISTORY ===== */
  const saveState = (newState) => {
    setHistory((prev) => [...prev, elements]);
    setElements(newState);
  };

  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setRedoStack((r) => [...r, elements]);
    setElements(prev);
    setHistory((h) => h.slice(0, -1));
  };

  const redo = () => {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((h) => [...h, elements]);
    setElements(next);
    setRedoStack((r) => r.slice(0, -1));
  };

  /* ===== ADD ELEMENT ===== */
  const addElement = (el) => saveState([...elements, el]);

  const addText = () =>
    addElement({
      id: Date.now(),
      type: "text",
      text: "Text",
      x: 100,
      y: 100,
      width: 150,
      height: 40,
      fontSize: 20,
      color: "#000",
    });

  const addShape = () =>
    addElement({
      id: Date.now(),
      type: "shape",
      x: 100,
      y: 100,
      width: 120,
      height: 80,
      color: "#ddd",
      borderRadius: 10,
    });

  const addIcon = (name) =>
    addElement({
      id: Date.now(),
      type: "icon",
      icon: name,
      x: 100,
      y: 100,
      width: 40,
      height: 40,
      color: "#000",
    });

  const addQR = () =>
    addElement({
      id: Date.now(),
      type: "qr",
      value: "https://yourbrand.com",
      x: 100,
      y: 100,
      width: 80,
      height: 80,
    });

  const addBarcode = () =>
    addElement({
      id: Date.now(),
      type: "barcode",
      value: "12345678",
      x: 100,
      y: 100,
      width: 150,
      height: 60,
    });

  /* ===== CLOUDINARY UPLOAD ===== */
  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        addElement({
          id: Date.now(),
          type: "image",
          src: data.url,
          x: 100,
          y: 100,
          width: 150,
          height: 100,
        });
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    }
  };

  /* ===== TEMPLATE LOAD ===== */
  const loadTemplate = (template) => {
    const newElements = template.elements.map((el) => ({
      ...el,
      id: Date.now() + Math.random(),
    }));

    saveState(newElements);
  };

  /* ===== UPDATE ===== */
  const update = (id, data) => {
    saveState(elements.map((el) => (el.id === id ? { ...el, ...data } : el)));
  };

  const selectedEl = elements.find((el) => el.id === selected);

  /* ===== DELETE ===== */
  const remove = () => {
    if (!selected) return;
    saveState(elements.filter((el) => el.id !== selected));
    setSelected(null);
  };

  /* ===== EXPORT ===== */
  const exportImg = async () => {
    const canvas = document.getElementById("canvas");
    const img = await html2canvas(canvas);

    const link = document.createElement("a");
    link.download = "label.png";
    link.href = img.toDataURL();
    link.click();
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* LEFT PANEL */}
      <div style={{ width: 240, background: "#111", color: "#fff", padding: 10, overflow: "auto" }}>
        <h3>Tools</h3>

        <button onClick={addText}>Text</button>
        <button onClick={addShape}>Shape</button>
        <button onClick={addQR}>QR</button>
        <button onClick={addBarcode}>Barcode</button>

        <input type="file" onChange={uploadImage} />

        <hr />

        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <button onClick={exportImg}>Export</button>

        <hr />

        <h4>Templates</h4>
        {templates.map((t) => (
          <div
            key={t.id}
            onClick={() => loadTemplate(t)}
            style={{
              padding: 8,
              marginBottom: 5,
              background: "#222",
              cursor: "pointer",
              borderRadius: 6,
            }}
          >
            {t.name}
          </div>
        ))}

        <hr />

        <h4>Icons</h4>
        {iconKeys.map((key, i) => {
          const Icon = Icons[key];
          return (
            <div key={i} onClick={() => addIcon(key)} style={{ cursor: "pointer" }}>
              <Icon />
            </div>
          );
        })}
      </div>

      {/* CANVAS */}
      <div
        id="canvas"
        style={{
          flex: 1,
          position: "relative",
          background: "#fff",
          backgroundSize: "20px 20px",
          backgroundImage:
            "linear-gradient(to right,#eee 1px,transparent 1px),linear-gradient(to bottom,#eee 1px,transparent 1px)",
        }}
      >
        {elements.map((el) => (
          <Rnd
            key={el.id}
            size={{ width: el.width, height: el.height }}
            position={{ x: el.x, y: el.y }}
            onDragStop={(e, d) => update(el.id, { x: d.x, y: d.y })}
            onResizeStop={(e, dir, ref, delta, pos) =>
              update(el.id, {
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                ...pos,
              })
            }
            onClick={() => setSelected(el.id)}
          >
            {el.type === "text" && (
              <div
                contentEditable
                style={{ fontSize: el.fontSize, color: el.color }}
                onBlur={(e) => update(el.id, { text: e.target.innerText })}
              >
                {el.text}
              </div>
            )}

            {el.type === "image" && (
              <img src={el.src} style={{ width: "100%", height: "100%" }} />
            )}

            {el.type === "qr" && <QRCodeCanvas value={el.value} />}
            {el.type === "barcode" && <Barcode value={el.value} />}

            {el.type === "icon" &&
              (() => {
                const Icon = Icons[el.icon];
                return <Icon size={el.width} color={el.color} />;
              })()}

            {el.type === "shape" && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: el.color,
                  borderRadius: el.borderRadius,
                }}
              />
            )}
          </Rnd>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: 220, background: "#eee", padding: 10 }}>
        <h3>Edit</h3>

        {selectedEl && (
          <>
            <input
              type="color"
              value={selectedEl.color || "#000"}
              onChange={(e) => update(selectedEl.id, { color: e.target.value })}
            />

            <input
              type="number"
              value={selectedEl.width}
              onChange={(e) => update(selectedEl.id, { width: Number(e.target.value) })}
            />

            <input
              type="number"
              value={selectedEl.height}
              onChange={(e) => update(selectedEl.id, { height: Number(e.target.value) })}
            />

            {selectedEl.type === "text" && (
              <input
                type="number"
                value={selectedEl.fontSize}
                onChange={(e) => update(selectedEl.id, { fontSize: Number(e.target.value) })}
              />
            )}

            <button onClick={remove} style={{ color: "red" }}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
