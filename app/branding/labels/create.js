"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateLabel() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    sku: "",
    size: "",
    quality: "",
    price: "",
    nutrition: { calories: "", protein: "", fat: "", carbs: "" },
    frontText: "",
    rearText: "",
    regulatoryInfo: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("nutrition.")) {
      const key = name.split(".")[1];
      setForm(prev => ({ ...prev, nutrition: { ...prev.nutrition, [key]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/branding/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) router.push("/branding/labels");
  };

  const handleAI = async () => {
    // 🔹 Optional AI generation
    const res = await fetch("/api/branding/labels/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: form.name }),
    });
    const data = await res.json();
    if (data.success) setForm(prev => ({ ...prev, ...data.generated }));
  };

  return (
    <div>
      <h1>Create Label</h1>
      <button onClick={handleAI} style={{ marginBottom: 10 }}>Auto-generate via AI</button>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
        <input name="sku" placeholder="SKU / Part Code" value={form.sku} onChange={handleChange} required />
        <input name="size" placeholder="Size / Volume" value={form.size} onChange={handleChange} />
        <input name="quality" placeholder="Quality/Grade" value={form.quality} onChange={handleChange} />
        <input name="price" placeholder="Price" value={form.price} onChange={handleChange} />
        <h3>Nutrition</h3>
        <input name="nutrition.calories" placeholder="Calories" value={form.nutrition.calories} onChange={handleChange} />
        <input name="nutrition.protein" placeholder="Protein" value={form.nutrition.protein} onChange={handleChange} />
        <input name="nutrition.fat" placeholder="Fat" value={form.nutrition.fat} onChange={handleChange} />
        <input name="nutrition.carbs" placeholder="Carbs" value={form.nutrition.carbs} onChange={handleChange} />
        <textarea name="frontText" placeholder="Front Label Text" value={form.frontText} onChange={handleChange} />
        <textarea name="rearText" placeholder="Rear Label Text" value={form.rearText} onChange={handleChange} />
        <textarea name="regulatoryInfo" placeholder="Regulatory / Compliance Info" value={form.regulatoryInfo} onChange={handleChange} />
        <button type="submit">Create Label</button>
      </form>
    </div>
  );
}
