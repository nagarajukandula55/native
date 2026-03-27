"use client";

import { useState } from "react";

export default function CreateLabelPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    sku: "",
    size: "Medium",
    quality: "Standard",
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    price: 0,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      nutrition: {
        calories: Number(form.calories),
        protein: Number(form.protein),
        fat: Number(form.fat),
        carbs: Number(form.carbs),
      },
      price: Number(form.price),
    };

    const res = await fetch("/api/branding/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      setSuccess("Label created successfully!");
      setForm({
        name: "",
        description: "",
        sku: "",
        size: "Medium",
        quality: "Standard",
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        price: 0,
      });
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Create Label</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 400 }}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" required />
        
        <select name="size" value={form.size} onChange={handleChange}>
          <option>Small</option>
          <option>Medium</option>
          <option>Large</option>
        </select>

        <select name="quality" value={form.quality} onChange={handleChange}>
          <option>Standard</option>
          <option>Premium</option>
        </select>

        <input name="calories" type="number" value={form.calories} onChange={handleChange} placeholder="Calories" />
        <input name="protein" type="number" value={form.protein} onChange={handleChange} placeholder="Protein" />
        <input name="fat" type="number" value={form.fat} onChange={handleChange} placeholder="Fat" />
        <input name="carbs" type="number" value={form.carbs} onChange={handleChange} placeholder="Carbs" />
        <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" required />

        <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Label"}</button>
      </form>
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}
