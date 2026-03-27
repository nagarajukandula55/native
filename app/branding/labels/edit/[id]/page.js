"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import jsPDF from "jspdf";
import { v4 as uuidv4 } from "uuid";

export default function EditLabelPage() {
  const { id } = useParams();
  const router = useRouter();
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ===== FETCH LABEL DATA ===== */
  const fetchLabel = async () => {
    const res = await fetch(`/api/branding/labels/${id}`);
    const data = await res.json();
    if (data.success) setForm(data.label);
    setLoading(false);
  };

  useEffect(() => {
    fetchLabel();
  }, [id]);

  /* ===== SAVE UPDATED LABEL ===== */
  const saveLabel = async () => {
    setSaving(true);
    const res = await fetch(`/api/branding/labels/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      alert("Label updated successfully!");
      router.push("/branding/dashboard");
    } else {
      alert(data.msg || "Error updating label");
    }
    setSaving(false);
  };

  /* ===== DELETE LABEL ===== */
  const deleteLabel = async () => {
    if (!confirm("Delete this label?")) return;
    const res = await fetch(`/api/branding/labels/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      alert("Label deleted!");
      router.push("/branding/dashboard");
    } else {
      alert(data.msg || "Error deleting label");
    }
  };

  /* ===== GENERATE LABEL IMAGE ===== */
  const generateLabelImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 600;
    canvas.height = 400;

    // Background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Logo
    const logo = new Image();
    logo.src = form.logoUrl;
    logo.onload = () => {
      ctx.drawImage(logo, 20, 20, 100, 50);

      // Product name
      ctx.fillStyle = "#000";
      ctx.font = "20px Arial";
      ctx.fillText(form.name, 20, 100);

      // SKU & size
      ctx.font = "16px Arial";
      ctx.fillText(`SKU: ${form.sku} | Size: ${form.size}`, 20, 130);

      // Quality & Price
      ctx.fillText(`Quality: ${form.quality} | Price: ₹${form.price}`, 20, 160);

      // Nutrition
      ctx.fillText(
        `Nutrition: Calories ${form.nutrition.calories}, Protein ${form.nutrition.protein}, Fat ${form.nutrition.fat}, Carbs ${form.nutrition.carbs}`,
        20,
        190
      );

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

  if (loading) return <p>Loading label data...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Edit Label</h1>

      <div style={{ border: "1px solid #ddd", padding: 15, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Product Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Size"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Quality"
          value={form.quality}
          onChange={(e) => setForm({ ...form, quality: e.target.value })}
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          style={inputStyle}
        />
        <h4>Nutrition</h4>
        <input
          type="number"
          placeholder="Calories"
          value={form.nutrition.calories}
          onChange={(e) =>
            setForm({
              ...form,
              nutrition: { ...form.nutrition, calories: Number(e.target.value) },
            })
          }
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Protein"
          value={form.nutrition.protein}
          onChange={(e) =>
            setForm({
              ...form,
              nutrition: { ...form.nutrition, protein: Number(e.target.value) },
            })
          }
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Fat"
          value={form.nutrition.fat}
          onChange={(e) =>
            setForm({
              ...form,
              nutrition: { ...form.nutrition, fat: Number(e.target.value) },
            })
          }
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Carbs"
          value={form.nutrition.carbs}
          onChange={(e) =>
            setForm({
              ...form,
              nutrition: { ...form.nutrition, carbs: Number(e.target.value) },
            })
          }
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Greeting / Social Post"
          value={form.greeting}
          onChange={(e) => setForm({ ...form, greeting: e.target.value })}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Logo URL"
          value={form.logoUrl}
          onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
          style={inputStyle}
        />

        <div style={{ marginTop: 10 }}>
          <button onClick={saveLabel} style={btnStyle} disabled={saving}>
            {saving ? "Saving..." : "Save Label"}
          </button>
          <button onClick={deleteLabel} style={{ ...btnStyle, marginLeft: 10, color: "red" }}>
            Delete Label
          </button>
          <button onClick={generateLabelImage} style={{ ...btnStyle, marginLeft: 10 }}>
            Generate Label Image
          </button>
          <button onClick={exportPDF} style={{ ...btnStyle, marginLeft: 10 }}>
            Export PDF
          </button>
        </div>

        <canvas ref={canvasRef} style={{ border: "1px dashed #aaa", marginTop: 10 }}></canvas>
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", marginBottom: 5, padding: 6 };
const btnStyle = { padding: "6px 12px", cursor: "pointer" };
