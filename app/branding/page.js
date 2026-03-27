"use client";

import { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";

export default function BrandingHub() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef();

  const [form, setForm] = useState({
    name: "",
    sku: "",
    size: "",
    quality: "",
    price: "",
    nutrition: { calories: "", protein: "", fat: "", carbs: "" },
    greeting: "",
    logoUrl: "/logo.png",
  });

  /* ===== FETCH LABELS ===== */
  const fetchLabels = async () => {
    const res = await fetch("/api/branding/labels");
    const data = await res.json();
    if (data.success) setLabels(data.labels);
    setLoading(false);
  };

  useEffect(() => { fetchLabels(); }, []);

  /* ===== DELETE LABEL ===== */
  const deleteLabel = async (id) => {
    if (!confirm("Delete this label?")) return;
    await fetch("/api/branding/labels", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchLabels();
  };

  /* ===== AUTO GENERATE ===== */
  const handleAutoGenerate = () => {
    const ts = Date.now().toString().slice(-5);
    const namePart = form.name ? form.name.replace(/\s+/g, "").toUpperCase().slice(0, 3) : "LBL";
    setForm(prev => ({
      ...prev,
      sku: `${namePart}-${ts}`,
      price: prev.price || (prev.size?.toLowerCase().includes("large") ? 80 : 50) + (prev.quality?.toLowerCase().includes("premium") ? 50 : 0),
      nutrition: {
        calories: prev.nutrition.calories || 100,
        protein: prev.nutrition.protein || 5,
        fat: prev.nutrition.fat || 3,
        carbs: prev.nutrition.carbs || 15,
      },
      greeting: prev.greeting || `Enjoy your ${prev.name || "product"}!`,
    }));
  };

  /* ===== SAVE LABEL ===== */
  const saveLabel = async () => {
    setSaving(true);
    const res = await fetch("/api/branding/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      alert("Label saved!");
      setForm({
        name: "",
        sku: "",
        size: "",
        quality: "",
        price: "",
        nutrition: { calories: "", protein: "", fat: "", carbs: "" },
        greeting: "",
        logoUrl: "/logo.png",
      });
      fetchLabels();
    } else {
      alert(data.msg || "Error saving label");
    }
    setSaving(false);
  };

  /* ===== GENERATE LABEL IMAGE ===== */
  const generateLabelImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 600;
    canvas.height = 400;

    // background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // logo
    const logo = new Image();
    logo.src = form.logoUrl;
    logo.onload = () => {
      ctx.drawImage(logo, 20, 20, 100, 50);

      // product name
      ctx.fillStyle = "#000";
      ctx.font = "20px Arial";
      ctx.fillText(form.name, 20, 100);

      // SKU & size
      ctx.font = "16px Arial";
      ctx.fillText(`SKU: ${form.sku} | Size: ${form.size}`, 20, 130);

      // Quality & Price
      ctx.fillText(`Quality: ${form.quality} | Price: ₹${form.price}`, 20, 160);

      // Nutrition
      ctx.fillText(`Nutrition: Calories ${form.nutrition.calories}, Protein ${form.nutrition.protein}, Fat ${form.nutrition.fat}, Carbs ${form.nutrition.carbs}`, 20, 190);

      // Greeting
      ctx.fillText(form.greeting, 20, 220);
    };
  };

  /* ===== EXPORT PDF ===== */
  const exportPDF = () => {
    const canvas = canvasRef.current;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape" });
    pdf.addImage(imgData, "PNG", 10, 10, 280, 200);
    pdf.save(`${form.name || "label"}.pdf`);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Branding & Label Automation</h1>

      {/* ===== CREATE / EDIT LABEL ===== */}
      <div style={{ border: "1px solid #ddd", padding: 15, marginBottom: 20 }}>
        <h2>Create / Edit Label</h2>

        <input type="text" placeholder="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        <input type="text" placeholder="Size" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} style={inputStyle} />
        <input type="text" placeholder="Quality" value={form.quality} onChange={e => setForm({ ...form, quality: e.target.value })} style={inputStyle} />
        <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} style={inputStyle} />
        <h4>Nutrition</h4>
        <input type="number" placeholder="Calories" value={form.nutrition.calories} onChange={e => setForm({ ...form, nutrition: { ...form.nutrition, calories: Number(e.target.value) } })} style={inputStyle} />
        <input type="number" placeholder="Protein" value={form.nutrition.protein} onChange={e => setForm({ ...form, nutrition: { ...form.nutrition, protein: Number(e.target.value) } })} style={inputStyle} />
        <input type="number" placeholder="Fat" value={form.nutrition.fat} onChange={e => setForm({ ...form, nutrition: { ...form.nutrition, fat: Number(e.target.value) } })} style={inputStyle} />
        <input type="number" placeholder="Carbs" value={form.nutrition.carbs} onChange={e => setForm({ ...form, nutrition: { ...form.nutrition, carbs: Number(e.target.value) } })} style={inputStyle} />
        <input type="text" placeholder="Greeting / Social Post" value={form.greeting} onChange={e => setForm({ ...form, greeting: e.target.value })} style={inputStyle} />
        <input type="text" placeholder="Logo URL" value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} style={inputStyle} />

        <div style={{ marginTop: 10 }}>
          <button onClick={handleAutoGenerate} style={btnStyle}>Auto-Generate</button>
          <button onClick={saveLabel} style={{ ...btnStyle, marginLeft: 10 }} disabled={saving}>{saving ? "Saving..." : "Save Label"}</button>
          <button onClick={generateLabelImage} style={{ ...btnStyle, marginLeft: 10 }}>Generate Label Image</button>
          <button onClick={exportPDF} style={{ ...btnStyle, marginLeft: 10 }}>Export PDF</button>
        </div>

        {/* ===== CANVAS PREVIEW ===== */}
        <canvas ref={canvasRef} style={{ border: "1px dashed #aaa", marginTop: 10 }}></canvas>
      </div>

      {/* ===== EXISTING LABELS ===== */}
      {labels.map(label => (
        <div key={label._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
          <h3>{label.name} ({label.sku})</h3>
          <p>Size: {label.size}, Quality: {label.quality}</p>
          <p>Price: ₹{label.price}</p>
          <p>Nutrition: Calories {label.nutrition?.calories}, Protein {label.nutrition?.protein}, Fat {label.nutrition?.fat}, Carbs {label.nutrition?.carbs}</p>
          <p>Greeting: {label.greeting}</p>
          <button onClick={() => deleteLabel(label._id)} style={{ color: "red", marginRight: 10 }}>Delete</button>
          <a href={`/branding/labels/edit/${label._id}`} style={{ color: "blue" }}>Edit</a>
        </div>
      ))}
    </div>
  );
}

const inputStyle = { width: "100%", marginBottom: 5, padding: 6 };
const btnStyle = { padding: "6px 12px", cursor: "pointer" };
