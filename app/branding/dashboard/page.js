"use client";

import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode.react";
import { useReactToPrint } from "react-to-print";

export default function BrandingDashboard() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState({
    name: "",
    sku: "",
    size: "",
    quality: "",
    price: 0,
    nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 },
  });
  const [logo, setLogo] = useState(null);
  const [socialText, setSocialText] = useState("");

  const printRef = useRef();

  /* ================= FETCH EXISTING LABELS ================= */
  const fetchLabels = async () => {
    const res = await fetch("/api/branding/labels");
    const data = await res.json();
    if (data.success) setLabels(data.labels);
    setLoading(false);
  };

  useEffect(() => { fetchLabels(); }, []);

  /* ================= CREATE NEW LABEL ================= */
  const createLabel = async () => {
    const res = await fetch("/api/branding/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLabel),
    });
    const data = await res.json();
    if (data.success) {
      fetchLabels();
      setNewLabel({
        name: "",
        sku: "",
        size: "",
        quality: "",
        price: 0,
        nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 },
      });
    }
  };

  /* ================= DELETE LABEL ================= */
  const deleteLabel = async (id) => {
    if (!confirm("Delete this label?")) return;
    await fetch("/api/branding/labels", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchLabels();
  };

  /* ================= PDF & PRINT ================= */
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Product Label", 10, 10);
    labels.forEach((label, i) => {
      doc.text(`${label.name} (${label.sku}) - ₹${label.price}`, 10, 20 + i * 10);
    });
    doc.save("labels.pdf");
  };

  /* ================= UI ================= */
  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Branding Dashboard</h1>

      {/* 🔹 Upload Logo */}
      <div style={{ marginBottom: 20 }}>
        <h3>Upload Logo</h3>
        <input type="file" onChange={(e) => setLogo(e.target.files[0])} />
        {logo && <p>Uploaded: {logo.name}</p>}
      </div>

      {/* 🔹 Create Label */}
      <div style={{ marginBottom: 20, border: "1px solid #ddd", padding: 15 }}>
        <h3>Create New Label</h3>
        <input placeholder="Product Name" value={newLabel.name} onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })} />
        <input placeholder="SKU" value={newLabel.sku} onChange={(e) => setNewLabel({ ...newLabel, sku: e.target.value })} />
        <input placeholder="Size" value={newLabel.size} onChange={(e) => setNewLabel({ ...newLabel, size: e.target.value })} />
        <input placeholder="Quality" value={newLabel.quality} onChange={(e) => setNewLabel({ ...newLabel, quality: e.target.value })} />
        <input type="number" placeholder="Price" value={newLabel.price} onChange={(e) => setNewLabel({ ...newLabel, price: Number(e.target.value) })} />
        <h4>Nutrition</h4>
        <input type="number" placeholder="Calories" value={newLabel.nutrition.calories} onChange={(e) => setNewLabel({ ...newLabel, nutrition: { ...newLabel.nutrition, calories: Number(e.target.value) } })} />
        <input type="number" placeholder="Protein" value={newLabel.nutrition.protein} onChange={(e) => setNewLabel({ ...newLabel, nutrition: { ...newLabel.nutrition, protein: Number(e.target.value) } })} />
        <input type="number" placeholder="Fat" value={newLabel.nutrition.fat} onChange={(e) => setNewLabel({ ...newLabel, nutrition: { ...newLabel.nutrition, fat: Number(e.target.value) } })} />
        <input type="number" placeholder="Carbs" value={newLabel.nutrition.carbs} onChange={(e) => setNewLabel({ ...newLabel, nutrition: { ...newLabel.nutrition, carbs: Number(e.target.value) } })} />
        <button onClick={createLabel} style={{ marginTop: 10 }}>Create Label</button>
      </div>

      {/* 🔹 Social Media Post */}
      <div style={{ marginBottom: 20 }}>
        <h3>Generate Social Media Post</h3>
        <textarea placeholder="Write your post..." value={socialText} onChange={(e) => setSocialText(e.target.value)} rows={3} style={{ width: "100%", marginBottom: 10 }} />
        <div style={{ border: "1px solid #ddd", padding: 10 }}>
          {logo && <img src={URL.createObjectURL(logo)} alt="logo" width={50} />}
          <p>{socialText}</p>
        </div>
      </div>

      {/* 🔹 Labels Preview & Actions */}
      <div ref={printRef} style={{ border: "1px solid #000", padding: 10 }}>
        {labels.map((label) => (
          <div key={label._id} style={{ border: "1px solid #ddd", marginBottom: 10, padding: 5 }}>
            <h4>{label.name} ({label.sku}) - ₹{label.price}</h4>
            <p>Size: {label.size}, Quality: {label.quality}</p>
            <p>Calories: {label.nutrition.calories}, Protein: {label.nutrition.protein}, Fat: {label.nutrition.fat}, Carbs: {label.nutrition.carbs}</p>
            <QRCode value={label.sku} size={64} />
            <button onClick={() => deleteLabel(label._id)} style={{ color: "red", marginTop: 5 }}>Delete</button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={handlePrint} style={{ marginRight: 10 }}>Print Labels</button>
        <button onClick={generatePDF}>Download PDF</button>
      </div>
    </div>
  );
}
