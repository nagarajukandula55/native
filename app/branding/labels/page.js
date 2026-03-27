"use client";

import { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import Barcode from "react-barcode";
import * as FaIcons from "react-icons/fa";

const iconList = Object.keys(FaIcons).slice(0, 80);

export default function UltraEditor() {

  const [elements, setElements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [name, setName] = useState("");

  /* ===== HISTORY ===== */
  const saveHistory = (newState) => {
    setHistory(prev => [...prev, elements]);
    setElements(newState);
  };

  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setRedoStack(r => [...r, elements]);
    setElements(prev);
    setHistory(h => h.slice(0, -1));
  };

  const redo = () => {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setHistory(h => [...h, elements]);
    setElements(next);
    setRedoStack(r => r.slice(0, -1));
  };

  /* ===== ADD ELEMENTS ===== */

  const addText = () => {
    saveHistory([...elements, {
      id: Date.now(),
      type: "text",
      text: "Text",
      x: 100, y: 100,
      width: 150, height: 40,
      fontSize: 20,
      color: "#000",
      fontWeight: "normal",
      textAlign: "left"
    }]);
  };

  const addShape = () => {
    saveHistory([...elements, {
      id: Date.now(),
      type: "shape",
      x: 100,
      y: 100,
      width: 120,
      height: 80,
      color: "#ddd",
      borderRadius: 10
    }]);
  };

  const addIcon = (iconName) => {
    saveHistory([...elements, {
      id: Date.now(),
      type: "icon",
      iconName,
      x: 100,
      y: 100,
      width: 40,
      height: 40,
      color: "#000"
    }]);
  };

  const addQR = () => {
    saveHistory([...elements, {
      id: Date.now(),
      type: "qr",
      value: "https://shopnative.in",
      x: 100,
      y: 100,
      width: 80,
      height: 80
    }]);
  };

  const addBarcode = () => {
    saveHistory([...elements, {
      id: Date.now(),
      type: "barcode",
      value: "12345678",
      x: 100,
      y: 100,
      width: 150,
      height: 60
    }]);
  };

  const addImage = () => {
    const url = prompt("Enter Image URL");
    if (!url) return;

    saveHistory([...elements, {
      id: Date.now(),
      type: "image",
      src: url,
      x: 100,
      y: 100,
      width: 150,
      height: 100
    }]);
  };

  /* ===== UPDATE ===== */

  const updateElement = (id, data) => {
    saveHistory(elements.map(el => el.id === id ? { ...el, ...data } : el));
  };

  const selectedEl = elements.find(el => el.id === selected);

  /* ===== EXPORT ===== */

  const exportImage = async () => {
    const canvas = document.getElementById("canvas");
    const img = await html2canvas(canvas);

    const link = document.createElement("a");
    link.download = "label.png";
    link.href = img.toDataURL();
    link.click();
  };

  /* ===== UI ===== */

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* LEFT PANEL */}
      <div style={{ width: 250, background: "#111", color: "#fff", padding: 10, overflow: "auto" }}>

        <h3>Tools</h3>

        <button onClick={addText}>Text</button>
        <button onClick={addShape}>Shape</button>
        <button onClick={addImage}>Image</button>
        <button onClick={addQR}>QR</button>
        <button onClick={addBarcode}>Barcode</button>

        <hr />

        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>

        <hr />

        <h4>Icons</h4>
        {iconList.map((name, i) => {
          const Icon = FaIcons[name];
          return <div key={i} onClick={() => addIcon(name)}><Icon /></div>;
        })}

        <hr />

        <button onClick={exportImage}>Export</button>
      </div>

      {/* CANVAS */}
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
                style={{
                  fontSize: el.fontSize,
                  color: el.color,
                  fontWeight: el.fontWeight,
                  textAlign: el.textAlign
                }}
                onBlur={(e) => updateElement(el.id, { text: e.target.innerText })}
              >
                {el.text}
              </div>
            )}

            {el.type === "image" && <img src={el.src} style={{ width: "100%", height: "100%" }} />}
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

      {/* RIGHT PANEL */}
      <div style={{ width: 250, background: "#eee", padding: 10 }}>
        <h3>Edit</h3>

        {selectedEl && (
          <>
            <input type="color"
              value={selectedEl.color || "#000"}
              onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
            />

            <input type="number"
              value={selectedEl.width}
              onChange={(e) => updateElement(selectedEl.id, { width: Number(e.target.value) })}
            />

            <input type="number"
              value={selectedEl.height}
              onChange={(e) => updateElement(selectedEl.id, { height: Number(e.target.value) })}
            />

            {selectedEl.type === "text" && (
              <>
                <input type="number"
                  value={selectedEl.fontSize}
                  onChange={(e) => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })}
                />

                <button onClick={() => updateElement(selectedEl.id, { fontWeight: "bold" })}>Bold</button>
                <button onClick={() => updateElement(selectedEl.id, { textAlign: "center" })}>Center</button>
                <button onClick={() => updateElement(selectedEl.id, { textAlign: "right" })}>Right</button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
