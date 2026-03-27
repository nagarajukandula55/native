"use client";
import { useState } from "react";
import QRCode from "qrcode.react";
import jsPDF from "jspdf";

export default function CreateLabel() {
  const [label, setLabel] = useState({
    name: "", sku: "", size: "", quality: "", price: 0,
    nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if(name in label.nutrition) {
      setLabel({ ...label, nutrition: { ...label.nutrition, [name]: Number(value) } });
    } else {
      setLabel({ ...label, [name]: value });
    }
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/branding/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(label)
    });
    if(res.ok) alert("Label Created!");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Label: ${label.name}`, 10, 10);
    doc.text(`SKU: ${label.sku}`, 10, 20);
    doc.text(`Size: ${label.size}, Quality: ${label.quality}`, 10, 30);
    doc.text(`Price: ₹${label.price}`, 10, 40);
    doc.text(`Nutrition: Calories ${label.nutrition.calories}, Protein ${label.nutrition.protein}`, 10, 50);
    doc.save(`${label.name}_label.pdf`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Create Label</h1>
      <input placeholder="Name" name="name" onChange={handleChange} />
      <input placeholder="SKU" name="sku" onChange={handleChange} />
      <input placeholder="Size" name="size" onChange={handleChange} />
      <input placeholder="Quality" name="quality" onChange={handleChange} />
      <input placeholder="Price" name="price" type="number" onChange={handleChange} />
      <h4>Nutrition</h4>
      <input placeholder="Calories" name="calories" type="number" onChange={handleChange} />
      <input placeholder="Protein" name="protein" type="number" onChange={handleChange} />
      <input placeholder="Fat" name="fat" type="number" onChange={handleChange} />
      <input placeholder="Carbs" name="carbs" type="number" onChange={handleChange} />
      <div style={{ marginTop: 20 }}>
        <QRCode value={`Product: ${label.name}, SKU: ${label.sku}`} />
      </div>
      <button onClick={handleSubmit}>Save Label</button>
      <button onClick={downloadPDF}>Download PDF</button>
    </div>
  );
}
