// app/branding/labels/create/page.js (also use for edit)
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LabelForm({ edit = false }) {
  const router = useRouter();
  const params = useSearchParams();
  const labelId = params.get("id");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    size: "",
    quality: "",
    price: 0,
    nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 },
  });

  useEffect(() => {
    if (edit && labelId) {
      fetch(`/api/branding/labels`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const lbl = data.labels.find(l => l._id === labelId);
            if (lbl) setForm(lbl);
          }
        });
    }
  }, [edit, labelId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("nutrition.")) {
      const key = name.split(".")[1];
      setForm(prev => ({ ...prev, nutrition: { ...prev.nutrition, [key]: Number(value) } }));
    } else if (name === "price") {
      setForm(prev => ({ ...prev, price: Number(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = edit ? "PUT" : "POST";
    const body = edit ? { _id: labelId, ...form } : form;

    const res = await fetch("/api/branding/labels", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.success) router.push("/branding/labels");
    else alert(data.msg);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>{edit ? "Edit Label" : "Create Label"}</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 400 }}>
        <input name="name" placeholder="Label Name" value={form.name} onChange={handleChange} required />
        <input name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} />
        <input name="size" placeholder="Size" value={form.size} onChange={handleChange} />
        <input name="quality" placeholder="Quality" value={form.quality} onChange={handleChange} />
        <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} />

        <h3>Nutrition</h3>
        <input type="number" name="nutrition.calories" placeholder="Calories" value={form.nutrition.calories} onChange={handleChange} />
        <input type="number" name="nutrition.protein" placeholder="Protein" value={form.nutrition.protein} onChange={handleChange} />
        <input type="number" name="nutrition.fat" placeholder="Fat" value={form.nutrition.fat} onChange={handleChange} />
        <input type="number" name="nutrition.carbs" placeholder="Carbs" value={form.nutrition.carbs} onChange={handleChange} />

        <button type="submit">{edit ? "Update Label" : "Create Label"}</button>
      </form>
    </div>
  );
}
