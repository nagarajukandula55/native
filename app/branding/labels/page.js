"use client";

import { useState } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import Barcode from "react-barcode";
import * as FaIcons from "react-icons/fa";

/* ICONS */
const icons = Object.keys(FaIcons).slice(0, 80);

export default function Editor() {
  const [elements, setElements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedo] = useState([]);
  const [name, setName] = useState("");

  /* ===== HISTORY ===== */
  const save = (newState) => {
    setHistory([...history, elements]);
    setElements(newState);
  };

  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setRedo([...redoStack, elements]);
    setElements(prev);
    setHistory(history.slice(0, -1));
  };

  const redo = () => {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setHistory([...history, elements]);
    setElements(next);
    setRedo(redoStack.slice(0, -1));
  };

  /* ===== ADD ===== */

  const addText = () => save([...elements, {
    id: Date.now(),
    type: "text",
    text: "Text",
    x: 100, y: 100,
    width: 150, height: 40,
    fontSize: 20,
    fontFamily: "Arial",
    color: "#000"
  }]);

  const addShape = () => save([...elements, {
    id: Date.now(),
    type: "shape",
    x: 100, y: 100,
    width: 120, height: 80,
    color: "#ddd",
    borderRadius: 10
  }]);

  const addIcon = (name) => save([...elements, {
    id: Date.now(),
    type: "icon",
    iconName: name,
    x: 100, y: 100,
    width: 40, height: 40,
    color: "#000"
  }]);

  const addQR = () => save([...elements, {
    id: Date.now(),
    type: "qr",
    value: "https://shopnative.in",
    x: 100, y: 100,
    width: 80, height: 80
  }]);

  const addBarcode = () => save([...elements, {
    id: Date.now(),
    type: "barcode",
    value: "123456789",
    x: 100, y: 100,
    width: 150, height: 60
  }]);

  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      save([...elements, {
        id: Date.now(),
        type: "image",
        src: reader.result,
        x: 100, y: 100,
        width: 150, height: 100
      }]);
    };
    reader.readAsDataURL(file);
  };

  /* ===== UPDATE ===== */

  const update = (id, data) => {
    save(elements.map(el => el.id === id ? { ...el, ...data } : el));
  };

  const selectedEl = elements.find(el => el.id === selected);

  /* ===== DELETE ===== */

  const remove = () => {
    if (!selected) return;
    save(elements.filter(el => el.id !== selected));
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

  /* ===== UI ===== */

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>

      {/* TOP BAR */}
      <div style={{
        height: 60,
        display: "flex",
        alignItems: "center",
        padding: 10,
        borderBottom: "1px solid #ddd",
        gap: 10
      }}>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <button onClick={exportImg}>Export</button>

        <input
          placeholder="Label Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", flex: 1 }}>

        {/* LEFT */}
        <div style={{ width: 220, background: "#111", color: "#fff", padding: 10 }}>
          <button onClick={addText}>Text</button>
          <button onClick={addShape}>Shape</button>
          <button onClick={addQR}>QR</button>
          <button onClick={addBarcode}>Barcode</button>

          <input type="file" onChange={uploadImage} />

          <h4>Icons</h4>
          {icons.map((i, idx) => {
            const Icon = FaIcons[i];
            return <div key={idx} onClick={() => addIcon(i)}><Icon /></div>;
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
            backgroundImage: `
              linear-gradient(to right,#eee 1px,transparent 1px),
              linear-gradient(to bottom,#eee 1px,transparent 1px)
            `
          }}
        >
          {elements.map(el => (
            <Rnd
              key={el.id}
              size={{ width: el.width, height: el.height }}
              position={{ x: el.x, y: el.y }}
              onDragStop={(e, d) => update(el.id, { x: d.x, y: d.y })}
              onResizeStop={(e, dir, ref, delta, pos) =>
                update(el.id, {
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
                    fontFamily: el.fontFamily,
                    color: el.color
                  }}
                  onBlur={(e) => update(el.id, { text: e.target.innerText })}
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
                <div style={{ width: "100%", height: "100%", background: el.color, borderRadius: el.borderRadius }} />
              )}
            </Rnd>
          ))}
        </div>

        {/* RIGHT */}
        <div style={{ width: 220, background: "#f1f5f9", padding: 10 }}>
          <h3>Edit</h3>

          {selectedEl && (
            <>
              <input type="color"
                value={selectedEl.color || "#000"}
                onChange={(e) => update(selectedEl.id, { color: e.target.value })}
              />

              <input type="number"
                value={selectedEl.width}
                onChange={(e) => update(selectedEl.id, { width: Number(e.target.value) })}
              />

              <input type="number"
                value={selectedEl.height}
                onChange={(e) => update(selectedEl.id, { height: Number(e.target.value) })}
              />

              {selectedEl.type === "text" && (
                <>
                  <input type="number"
                    value={selectedEl.fontSize}
                    onChange={(e) => update(selectedEl.id, { fontSize: Number(e.target.value) })}
                  />

                  <select
                    value={selectedEl.fontFamily}
                    onChange={(e) => update(selectedEl.id, { fontFamily: e.target.value })}
                  >
                    <option>Arial</option>
                    <option>Verdana</option>
                    <option>Georgia</option>
                    <option>Times New Roman</option>
                  </select>
                </>
              )}

              <button onClick={remove} style={{ color: "red" }}>Delete</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
