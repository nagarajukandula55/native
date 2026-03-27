"use client";

import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";

export default function LabelSystem() {
  const frontRef = useRef(null);
  const backRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    tagline: "",
    netWeight: "",
    price: "",
    ingredients: "",
    fssai: "",
    manufacturer: "",
    expiry: "",
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
    logo: "/logo.png",
  });

  /* ================= PDF EXPORT (FIXED) ================= */
  const exportPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");

    const frontCanvas = await html2canvas(frontRef.current);
    const frontImg = frontCanvas.toDataURL("image/png");

    const backCanvas = await html2canvas(backRef.current);
    const backImg = backCanvas.toDataURL("image/png");

    // Front page
    pdf.addImage(frontImg, "PNG", 10, 10, 180, 100);

    // Back page
    pdf.addPage();
    pdf.addImage(backImg, "PNG", 10, 10, 180, 150);

    pdf.save(`${form.name || "label"}.pdf`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Professional Label Generator</h1>

      {/* ================= FORM ================= */}
      <div style={{ marginBottom: 20 }}>
        <input placeholder="Product Name" onChange={e => setForm({ ...form, name: e.target.value })} style={input}/>
        <input placeholder="Tagline" onChange={e => setForm({ ...form, tagline: e.target.value })} style={input}/>
        <input placeholder="Net Weight (500g)" onChange={e => setForm({ ...form, netWeight: e.target.value })} style={input}/>
        <input placeholder="MRP ₹" onChange={e => setForm({ ...form, price: e.target.value })} style={input}/>
        <input placeholder="Ingredients" onChange={e => setForm({ ...form, ingredients: e.target.value })} style={input}/>
        <input placeholder="FSSAI License" onChange={e => setForm({ ...form, fssai: e.target.value })} style={input}/>
        <input placeholder="Manufacturer Details" onChange={e => setForm({ ...form, manufacturer: e.target.value })} style={input}/>
        <input placeholder="Expiry Date" onChange={e => setForm({ ...form, expiry: e.target.value })} style={input}/>

        <h4>Nutrition</h4>
        <input placeholder="Calories" onChange={e => setForm({ ...form, calories: e.target.value })} style={input}/>
        <input placeholder="Protein" onChange={e => setForm({ ...form, protein: e.target.value })} style={input}/>
        <input placeholder="Fat" onChange={e => setForm({ ...form, fat: e.target.value })} style={input}/>
        <input placeholder="Carbs" onChange={e => setForm({ ...form, carbs: e.target.value })} style={input}/>
      </div>

      {/* ================= FRONT LABEL ================= */}
      <h2>Front Label</h2>
      <div ref={frontRef} style={frontStyle}>
        <img src={form.logo} style={{ height: 50 }} />

        <h1>{form.name || "Product Name"}</h1>
        <p>{form.tagline || "Tagline here"}</p>

        <p><b>Net Weight:</b> {form.netWeight}</p>
        <p><b>MRP:</b> ₹{form.price}</p>
      </div>

      {/* ================= BACK LABEL ================= */}
      <h2>Back Label</h2>
      <div ref={backRef} style={backStyle}>
        <h3>Ingredients</h3>
        <p>{form.ingredients}</p>

        <h3>Nutrition Facts</h3>
        <table style={table}>
          <tbody>
            <tr><td>Calories</td><td>{form.calories}</td></tr>
            <tr><td>Protein</td><td>{form.protein}</td></tr>
            <tr><td>Fat</td><td>{form.fat}</td></tr>
            <tr><td>Carbohydrates</td><td>{form.carbs}</td></tr>
          </tbody>
        </table>

        <p><b>FSSAI:</b> {form.fssai}</p>
        <p><b>Manufacturer:</b> {form.manufacturer}</p>
        <p><b>Expiry:</b> {form.expiry}</p>

        <div style={{ marginTop: 10 }}>
          <QRCodeCanvas value={form.name || "product"} size={80} />
        </div>
      </div>

      {/* ================= BUTTON ================= */}
      <button onClick={exportPDF} style={btn}>Download PDF</button>
    </div>
  );
}

/* ================= STYLES ================= */

const input = { display: "block", marginBottom: 6, padding: 6, width: 300 };

const frontStyle = {
  width: 350,
  height: 220,
  border: "1px solid #000",
  padding: 10,
  background: "#fff",
  marginBottom: 20
};

const backStyle = {
  width: 350,
  border: "1px solid #000",
  padding: 10,
  background: "#fff"
};

const table = {
  width: "100%",
  border: "1px solid #000",
  marginTop: 10
};

const btn = {
  padding: "10px 20px",
  marginTop: 20,
  cursor: "pointer"
};
