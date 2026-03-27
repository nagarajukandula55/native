"use client";

import { useEffect, useState } from "react";

export default function LabelsPage() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ========== FORM STATE ========== */
  const [form, setForm] = useState({
    name: "",
    sku: "",
    size: "",
    quality: "",
    price: "",
    nutrition: { calories: "", protein: "", fat: "", carbs: "" },
  });

  const [saving, setSaving] = useState(false);

  /* ================= FETCH LABELS ================= */
  const fetchLabels = async () => {
    const res = await fetch("/api/branding/labels");
    const data = await res.json();
    if (data.success) setLabels(data.labels);
    setLoading(false);
  };

  useEffect(() => { fetchLabels(); }, []);

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

  /* ================= AUTO GENERATE LABEL ================= */
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
      }
    }));
  };

  /* ================= SAVE LABEL ================= */
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
      setForm({ name: "", sku: "", size: "", quality: "", price: "", nutrition: { calories: "", protein: "", fat: "", carbs: "" } });
      fetchLabels();
    } else {
      alert(data.msg || "Error saving label");
    }
    setSaving(false);
  };

  /* ================= UI ================= */
  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Labels</h1>

      {/* ===== CREATE NEW LABEL ===== */}
      <div style={{ border: "1px solid #ddd", padding: 10, marginBottom: 20 }}>
        <h2>Create New Label</h2>

        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          style={{ width: "100%", marginBottom: 5, padding: 5 }}
        />

        <input
          type="text"
          placeholder="Size"
          value={form.size}
          onChange={e => setForm({ ...form, size: e.target.value })}
          style={{ width: "100%", marginBottom: 5, padding: 5 }}
        />

        <input
          type="text"
          placeholder="Quality"
          value={form.quality}
          onChange={e => setForm({ ...form, quality: e.target.value })}
          style={{ width: "100%", marginBottom: 5, padding: 5 }}
        />

        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={e => setForm({ ...form, price: Number(e.target.value) })}
          style={{ width: "100%", marginBottom: 5, padding: 5 }}
        />

        <h4>Nutrition</h4>
        <input
          type="number"
          placeholder="Calories"
          value={form.nutrition.calories}
          onChange={e => setForm({ ...form, nutrition: { ...form.nutrition, calories: Number(e.target.value) } })}
          style={{ width: "100%", marginBottom: 5, padding: 5 }}
        />
        <input
          type="number"
          placeholder="Protein"
          value={form.nutrition.protein}
          onChange={e => setForm({ ...form, nutrition: { ...form.nutrition, protein: Number(e.target.value) } })}
          style={{ width: "100%", marginBottom: 5, padding: 5 }}
        />
        <input
          type="number"
          placeholder="Fat"
          value={form.nutrition.fat}
          onChange={e => setForm({ ...form, nutrition: { ...form.nutrition, fat: Number(e.target.value) } })}
          style={{ width: "100%", marginBottom: 5, padding: 5 }}
        />
        <input
          type="number"
          placeholder="Carbs"
          value={form.nutrition.carbs}
          onChange={e => setForm({ ...form, nutrition: { ...form.nutrition, carbs: Number(e.target.value) } })}
          style={{ width: "100%", marginBottom: 5, padding: 5 }}
        />

        <button onClick={handleAutoGenerate} style={{ marginBottom: 5 }}>Generate Label Automatically</button>
        <button onClick={saveLabel} disabled={saving} style={{ marginBottom: 10, marginLeft: 5 }}>
          {saving ? "Saving..." : "Save Label"}
        </button>

        {/* ===== PREVIEW CARD ===== */}
        <div style={{ border: "1px dashed #aaa", padding: 10 }}>
          <h3>{form.name || "Name"} ({form.sku || "SKU"})</h3>
          <p>Size: {form.size || "-"}, Quality: {form.quality || "-"}</p>
          <p>Price: ₹{form.price || "-"}</p>
          <p>Nutrition: Calories {form.nutrition.calories || "-"}, Protein {form.nutrition.protein || "-"}, Fat {form.nutrition.fat || "-"}, Carbs {form.nutrition.carbs || "-"}</p>
        </div>
      </div>

      {/* ===== EXISTING LABELS ===== */}
      {labels.map((label) => (
        <div key={label._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
          <h3>{label.name} ({label.sku})</h3>
          <p>Size: {label.size}, Quality: {label.quality}</p>
          <p>Price: ₹{label.price}</p>
          <p>Nutrition: Calories {label.nutrition?.calories}, Protein {label.nutrition?.protein}, Fat {label.nutrition?.fat}, Carbs {label.nutrition?.carbs}</p>
          <button onClick={() => deleteLabel(label._id)} style={{ color: "red", marginRight: 10 }}>Delete</button>
          <a href={`/branding/labels/edit/${label._id}`} style={{ color: "blue" }}>Edit</a>
        </div>
      ))}
    </div>
  );
}
