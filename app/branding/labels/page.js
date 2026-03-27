"use client";

import { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import Barcode from "react-barcode";
import * as FaIcons from "react-icons/fa";

/* ICON LIST */
const iconList = Object.keys(FaIcons).slice(0, 60);

export default function LabelProEditor() {
  const [front, setFront] = useState([]);
  const [back, setBack] = useState([]);
  const [side, setSide] = useState("front");
  const [selected, setSelected] = useState(null);
  const [labels, setLabels] = useState([]);
  const [name, setName] = useState("");

  const elements = side === "front" ? front : back;
  const setElements = side === "front" ? setFront : setBack;

  useEffect(() => { fetchLabels(); }, []);

  const fetchLabels = async () => {
    const res = await fetch("/api/branding/labels");
    const data = await res.json();
    if (data.success) setLabels(data.labels);
  };

  /* ================= ADD ELEMENTS ================= */

  const addText = () => {
    setElements(p => [...p, {
      id: Date.now(),
      type: "text",
      text: "Text",
      x: 100, y: 100,
      width: 150, height: 40,
      fontSize: 18,
      color: "#000",
    }]);
  };

  const addImage = () => {
    const url = prompt("Enter Image URL");
    if (!url) return;

    setElements(p => [...p, {
      id: Date.now(),
      type: "image",
      src: url,
      x: 100, y: 100,
      width: 120, height: 80,
    }]);
  };

  const addQR = () => {
    setElements(p => [...p, {
      id: Date.now(),
      type: "qr",
      value: "https://shopnative.in",
      x: 100, y: 100,
      width: 80, height: 80,
    }]);
  };

  const addBarcode = () => {
    setElements(p => [...p, {
      id: Date.now(),
      type: "barcode",
      value: "123456789",
      x: 100, y: 100,
      width: 150, height: 60,
    }]);
  };

  const addIcon = (iconName) => {
    setElements(p => [...p, {
      id: Date.now(),
      type: "icon",
      iconName,
      x: 100,
      y: 100,
      width: 40,
      height: 40,
      color: "#000",
    }]);
  };

  const addShape = (type) => {
    const shapes = {
      rect: { borderRadius: 0 },
      circle: { borderRadius: "50%" },
      rounded: { borderRadius: "20px" },
      capsule: { borderRadius: "50px" },
    };

    setElements(p => [...p, {
      id: Date.now(),
      type: "shape",
      x: 100,
      y: 100,
      width: 120,
      height: 80,
      color: "#ddd",
      ...shapes[type],
    }]);
  };

  /* ================= UPDATE ================= */

  const updateElement = (id, data) => {
    setElements(p => p.map(el => el.id === id ? { ...el, ...data } : el));
  };

  const selectedEl = elements.find(el => el.id === selected);

  /* ================= SAVE ================= */

  const save = async () => {
    await fetch("/api/branding/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, front, back }),
    });

    alert("Saved!");
    fetchLabels();
  };

  const load = (l) => {
    setFront(l.front);
    setBack(l.back);
    setName(l.name);
  };

  /* ================= EXPORT ================= */

  const exportImage = async () => {
    const canvas = document.getElementById("canvas");
    const img = await html2canvas(canvas);

    const link = document.createElement("a");
    link.download = "label.png";
    link.href = img.toDataURL();
    link.click();
  };

  /* ================= UI ================= */

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* ===== LEFT SIDEBAR ===== */}
      <div style={{
        width: 260,
        background: "#0f172a",
        color: "#fff",
        padding: 10,
        overflowY: "auto"
      }}>

        <h3>Design</h3>

        <button onClick={() => setSide("front")}>Front</button>
        <button onClick={() => setSide("back")}>Back</button>

        <hr />

        <button onClick={addText}>Text</button>
        <button onClick={addImage}>Image</button>
        <button onClick={addQR}>QR</button>
        <button onClick={addBarcode}>Barcode</button>

        <hr />

        <h4>Shapes</h4>
        <button onClick={() => addShape("rect")}>Rectangle</button>
        <button onClick={() => addShape("circle")}>Circle</button>
        <button onClick={() => addShape("rounded")}>Rounded</button>
        <button onClick={() => addShape("capsule")}>Capsule</button>

        <hr />

        <h4>Icons</h4>
        <div style={{ maxHeight: 200, overflow: "auto" }}>
          {iconList.map((iconName, i) => {
            const Icon = FaIcons[iconName];
            return (
              <div key={i} onClick={() => addIcon(iconName)} style={{ cursor: "pointer" }}>
                <Icon />
              </div>
            );
          })}
        </div>

        <hr />

        <input
          placeholder="Label Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", marginBottom: 5 }}
        />

        <button onClick={save}>Save</button>
        <button onClick={exportImage}>Export</button>

        <hr />

        <h4>Saved</h4>
        {labels.map(l => (
          <div key={l._id} onClick={() => load(l)} style={{ cursor: "pointer" }}>
            {l.name}
          </div>
        ))}
      </div>

      {/* ===== CANVAS ===== */}
      <div
        id="canvas"
        style={{
          flex: 1,
          position: "relative",
          background: "#fff",
          backgroundSize: "20px 20px",
          backgroundImage: `
            linear-gradient(to right, #eee 1px, transparent 1px),
            linear-gradient(to bottom, #eee 1px, transparent 1px)
          `
        }}
      >
        {elements.map(el => (
          <Rnd
            key={el.id}
            size={{ width: el.width, height: el.height }}
            position={{ x: el.x, y: el.y }}
            onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateElement(el.id, {
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                ...pos
              })
            }
            onClick={() => setSelected(el.id)}
          >
            {el.type === "text" && (
              <div
                contentEditable
                suppressContentEditableWarning
                style={{
                  fontSize: el.fontSize,
                  color: el.color
                }}
                onBlur={(e) => updateElement(el.id, { text: e.target.innerText })}
              >
                {el.text}
              </div>
            )}

            {el.type === "image" && (
              <img src={el.src} style={{ width: "100%", height: "100%" }} />
            )}

            {el.type === "qr" && <QRCodeCanvas value={el.value} />}
            {el.type === "barcode" && <Barcode value={el.value} />}

            {el.type === "icon" && (() => {
              const Icon = FaIcons[el.iconName];
              return <Icon size={el.width} color={el.color} />;
            })()}

            {el.type === "shape" && (
              <div style={{
                width: "100%",
                height: "100%",
                background: el.color,
                borderRadius: el.borderRadius
              }} />
            )}
          </Rnd>
        ))}
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div style={{
        width: 260,
        background: "#f1f5f9",
        padding: 10
      }}>

        <h3>Edit</h3>

        {selectedEl && (
          <>
            <input
              type="color"
              value={selectedEl.color || "#000"}
              onChange={(e) =>
                updateElement(selectedEl.id, { color: e.target.value })
              }
            />

            <input
              type="number"
              value={selectedEl.width}
              onChange={(e) =>
                updateElement(selectedEl.id, { width: Number(e.target.value) })
              }
            />

            <input
              type="number"
              value={selectedEl.height}
              onChange={(e) =>
                updateElement(selectedEl.id, { height: Number(e.target.value) })
              }
            />

            {selectedEl.type === "text" && (
              <input
                type="number"
                value={selectedEl.fontSize}
                onChange={(e) =>
                  updateElement(selectedEl.id, { fontSize: Number(e.target.value) })
                }
              />
            )}
          </>
        )}

        <hr />

        <h4>Layers</h4>
        {elements.map((el, i) => (
          <div key={el.id} onClick={() => setSelected(el.id)}>
            {el.type} #{i}
          </div>
        ))}
      </div>
    </div>
  );
}
