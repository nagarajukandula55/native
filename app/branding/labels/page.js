"use client";

import { useEffect, useState } from "react";

export default function LabelsPage() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    sku: "",
    size: "",
    quality: "",
    price: "",
    nutrition: { calories: "", protein: "", fat: "", carbs: "" },
  });

  /* ================= FETCH LABELS ================= */
  const fetchLabels = async () => {
    setLoading(true);
    const res = await fetch("/api/branding/labels");
    const data = await res.json();
    if (data.success) setLabels(data.labels);
    setLoading(false);
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

  /* ================= OPEN FORM ================= */
  const openForm = (label = null) => {
    if (label) {
      setFormData(label);
    } else {
      setFormData({
        _id: null,
        name: "",
        sku: "",
        size: "",
        quality: "",
        price: "",
        nutrition: { calories: "", protein: "", fat: "", carbs: "" },
      });
    }
    setFormVisible(true);
  };

  /* ================= SAVE LABEL ================= */
  const saveLabel = async (e) => {
    e.preventDefault();
    const method = formData._id ? "PUT" : "POST";
    const res = await fetch("/api/branding/labels", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.success) {
      fetchLabels();
      setFormVisible(false);
    } else {
      alert(data.msg || "Error saving label");
    }
  };

  useEffect(() => { fetchLabels(); }, []);

  if (loading) return <p>Loading labels...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Branding Labels</h1>

      {!formVisible && (
        <button onClick={() => openForm()} style={{ marginBottom: 20, padding: 8, background: "#2563eb", color: "#fff", borderRadius: 6 }}>
          + Create Label
        </button>
      )}

      {/* ================= FORM ================= */}
      {formVisible && (
        <form onSubmit={saveLabel} style={{ border: "1px solid #ddd", padding: 15, marginBottom: 20, borderRadius: 6 }}>
          <h3>{formData._id ? "Edit Label" : "Create Label"}</h3>

          <input
            placeholder="Label Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={inputStyle}
            required
          />
          <input
            placeholder="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            style={inputStyle}
            required
          />
          <input
            placeholder="Size"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Quality"
            value={formData.quality}
            onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            style={inputStyle}
          />

          <h4>Nutrition</h4>
          <input
            placeholder="Calories"
            type="number"
            value={formData.nutrition.calories}
            onChange={(e) => setFormData({ ...formData, nutrition: { ...formData.nutrition, calories: e.target.value } })}
            style={inputStyle}
          />
          <input
            placeholder="Protein"
            type="number"
            value={formData.nutrition.protein}
            onChange={(e) => setFormData({ ...formData, nutrition: { ...formData.nutrition, protein: e.target.value } })}
            style={inputStyle}
          />
          <input
            placeholder="Fat"
            type="number"
            value={formData.nutrition.fat}
            onChange={(e) => setFormData({ ...formData, nutrition: { ...formData.nutrition, fat: e.target.value } })}
            style={inputStyle}
          />
          <input
            placeholder="Carbs"
            type="number"
            value={formData.nutrition.carbs}
            onChange={(e) => setFormData({ ...formData, nutrition: { ...formData.nutrition, carbs: e.target.value } })}
            style={inputStyle}
          />

          <div style={{ marginTop: 10 }}>
            <button type="submit" style={{ ...buttonStyle, background: "#16a34a" }}>Save</button>
            <button type="button" onClick={() => setFormVisible(false)} style={{ ...buttonStyle, background: "#ef4444", marginLeft: 10 }}>Cancel</button>
          </div>
        </form>
      )}

      {/* ================= LABEL LIST ================= */}
      {labels.map((label) => (
        <div key={label._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10, borderRadius: 6 }}>
          <h3>{label.name} ({label.sku})</h3>
          <p>Size: {label.size}, Quality: {label.quality}</p>
          <p>Price: ₹{label.price}</p>
          <p>Nutrition: Calories {label.nutrition?.calories}, Protein {label.nutrition?.protein}, Fat {label.nutrition?.fat}, Carbs {label.nutrition?.carbs}</p>

          <button onClick={() => deleteLabel(label._id)} style={{ color: "red", marginRight: 10 }}>Delete</button>
          <button onClick={() => openForm(label)} style={{ color: "blue" }}>Edit</button>
        </div>
      ))}
    </div>
  );
}

/* ===== STYLES ===== */
const inputStyle = { width: "100%", padding: 8, marginTop: 8, borderRadius: 6, border: "1px solid #ddd" };
const buttonStyle = { padding: "6px 12px", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
