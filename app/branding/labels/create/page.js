"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function CreateLabel() {
  const router = useRouter();

  const [label, setLabel] = useState({
    name: "",
    sku: "",
    size: "",
    quality: "",
    price: 0,
    nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 },
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("nutrition.")) {
      const key = name.split(".")[1];
      setLabel((prev) => ({
        ...prev,
        nutrition: { ...prev.nutrition, [key]: value },
      }));
    } else {
      setLabel((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/branding/labels", label);
      router.push("/branding/labels");
    } catch (err) {
      console.error("Create Label Error:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Create New Label</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input type="text" name="name" placeholder="Product Name" value={label.name} onChange={handleChange} required />
        <input type="text" name="sku" placeholder="SKU" value={label.sku} onChange={handleChange} required />
        <input type="text" name="size" placeholder="Size" value={label.size} onChange={handleChange} />
        <input type="text" name="quality" placeholder="Quality" value={label.quality} onChange={handleChange} />
        <input type="number" name="price" placeholder="Price" value={label.price} onChange={handleChange} />

        <h4>Nutrition Info</h4>
        <input type="number" name="nutrition.calories" placeholder="Calories" value={label.nutrition.calories} onChange={handleChange} />
        <input type="number" name="nutrition.protein" placeholder="Protein" value={label.nutrition.protein} onChange={handleChange} />
        <input type="number" name="nutrition.fat" placeholder="Fat" value={label.nutrition.fat} onChange={handleChange} />
        <input type="number" name="nutrition.carbs" placeholder="Carbs" value={label.nutrition.carbs} onChange={handleChange} />

        <textarea name="description" placeholder="Description" value={label.description} onChange={handleChange} />

        <button type="submit" style={{ marginTop: 10, padding: "8px 12px", background: "#2563eb", color: "#fff" }}>Create Label</button>
      </form>
    </div>
  );
}
