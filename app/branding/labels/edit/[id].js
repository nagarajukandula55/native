"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditLabel() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchLabel = async () => {
      const res = await fetch(`/api/branding/labels/${id}`);
      const data = await res.json();
      if (data.success) setForm(data.label);
    };
    fetchLabel();
  }, [id]);

  if (!form) return <p>Loading...</p>;

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
    await fetch(`/api/branding/labels/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/branding/labels");
  };

  return (
    <div>
      <h1>Edit Label</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} />
        <input name="sku" value={form.sku} onChange={handleChange} />
        <input name="size" value={form.size} onChange={handleChange} />
        <input name="quality" value={form.quality} onChange={handleChange} />
        <input name="price" value={form.price} onChange={handleChange} />
        <textarea name="frontText" value={form.frontText} onChange={handleChange} />
        <textarea name="rearText" value={form.rearText} onChange={handleChange} />
        <textarea name="regulatoryInfo" value={form.regulatoryInfo} onChange={handleChange} />
        <h3>Nutrition</h3>
        <input name="nutrition.calories" value={form.nutrition.calories} onChange={handleChange} />
        <input name="nutrition.protein" value={form.nutrition.protein} onChange={handleChange} />
        <input name="nutrition.fat" value={form.nutrition.fat} onChange={handleChange} />
        <input name="nutrition.carbs" value={form.nutrition.carbs} onChange={handleChange} />
        <button type="submit">Update Label</button>
      </form>
    </div>
  );
}
