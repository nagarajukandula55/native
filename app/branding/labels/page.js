"use client";

import { useState } from "react";
import { Rnd } from "react-rnd";
import { QRCodeCanvas } from "qrcode.react";

export default function LabelBuilder() {
  const [elements, setElements] = useState([
    {
      id: "title",
      text: "Dosa Mix",
      x: 150,
      y: 200,
      width: 200,
      height: 40,
      fontSize: 28,
      color: "#fff",
    },
    {
      id: "tagline",
      text: "100% Natural - No Preservatives",
      x: 140,
      y: 250,
      width: 260,
      height: 30,
      fontSize: 14,
      color: "#eee",
    },
  ]);

  const updateElement = (id, newProps) => {
    setElements(prev =>
      prev.map(el => (el.id === id ? { ...el, ...newProps } : el))
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Premium Label Builder</h1>

      {/* ================= FRONT LABEL ================= */}
      <div style={canvas}>

        {/* Background */}
        <div style={background}></div>

        {/* Logo Badge */}
        <div style={badge}>
          <img src="/logo.png" style={{ width: 120 }} />
        </div>

        {/* Product Image */}
        <img
          src="/dosa.png"
          style={productImage}
        />

        {/* Veg Icon */}
        <div style={veg}></div>

        {/* Editable Elements */}
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
                ...pos,
              })
            }
          >
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateElement(el.id, { text: e.target.innerText })}
              style={{
                color: el.color,
                fontSize: el.fontSize,
                textAlign: "center",
                cursor: "move",
              }}
            >
              {el.text}
            </div>
          </Rnd>
        ))}
      </div>

      {/* ================= BACK LABEL ================= */}
      <h2 style={{ marginTop: 40 }}>Back Label</h2>

      <div style={backLabel}>
        <h3>Ingredients</h3>
        <p>Rice Flour, Urad Dal, Salt</p>

        <h3>Nutrition Facts</h3>
        <table style={table}>
          <tbody>
            <tr><td>Calories</td><td>120 kcal</td></tr>
            <tr><td>Protein</td><td>4g</td></tr>
            <tr><td>Fat</td><td>2g</td></tr>
            <tr><td>Carbs</td><td>22g</td></tr>
          </tbody>
        </table>

        <p><b>FSSAI:</b> 1234567890</p>
        <p><b>Manufacturer:</b> Native Foods Pvt Ltd</p>
        <p><b>Expiry:</b> 6 Months</p>

        <QRCodeCanvas value="Native Dosa Mix" size={80} />
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const canvas = {
  width: 400,
  height: 600,
  position: "relative",
  borderRadius: 30,
  overflow: "hidden",
  background: "#3b2415",
};

const background = {
  position: "absolute",
  width: "100%",
  height: "60%",
  background: "#e8dccb",
  borderBottomLeftRadius: "50%",
  borderBottomRightRadius: "50%",
};

const badge = {
  position: "absolute",
  top: 40,
  left: "50%",
  transform: "translateX(-50%)",
  background: "#fff",
  padding: 10,
  borderRadius: "50%",
};

const productImage = {
  position: "absolute",
  bottom: 0,
  width: "100%",
};

const veg = {
  position: "absolute",
  bottom: 20,
  right: 20,
  width: 20,
  height: 20,
  border: "2px solid green",
  background: "green",
};

const backLabel = {
  width: 400,
  padding: 20,
  border: "1px solid #000",
  marginTop: 20,
  background: "#fff",
};

const table = {
  width: "100%",
  border: "1px solid #000",
};
