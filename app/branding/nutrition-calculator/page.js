"use client";

import { useState } from "react";

export default function NutritionPricing() {
  const [form, setForm] = useState({
    productName: "",
    rawMaterialCost: 0,
    packagingCost: 0,
    laborCost: 0,
    marketingCost: 0,
    logisticsCost: 0,
    gstPercent: 18,
    nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 },
  });

  const [finalPrice, setFinalPrice] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("nutrition.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({ ...prev, nutrition: { ...prev.nutrition, [key]: parseFloat(value) || 0 } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: parseFloat(value) || value }));
    }
  };

  const calculatePrice = () => {
    const base = parseFloat(form.rawMaterialCost || 0) +
                 parseFloat(form.packagingCost || 0) +
                 parseFloat(form.laborCost || 0) +
                 parseFloat(form.marketingCost || 0) +
                 parseFloat(form.logisticsCost || 0);

    const gst = (base * parseFloat(form.gstPercent)) / 100;
    setFinalPrice(base + gst);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Nutrition & Pricing Calculator</h1>
      <div style={{ display: "grid", gap: 10, maxWidth: 500 }}>
        <input name="productName" placeholder="Product Name" value={form.productName} onChange={handleChange} />
        <input type="number" name="rawMaterialCost" placeholder="Raw Material Cost" value={form.rawMaterialCost} onChange={handleChange} />
        <input type="number" name="packagingCost" placeholder="Packaging Cost" value={form.packagingCost} onChange={handleChange} />
        <input type="number" name="laborCost" placeholder="Labor Cost" value={form.laborCost} onChange={handleChange} />
        <input type="number" name="marketingCost" placeholder="Marketing Cost" value={form.marketingCost} onChange={handleChange} />
        <input type="number" name="logisticsCost" placeholder="Logistics Cost" value={form.logisticsCost} onChange={handleChange} />
        <input type="number" name="gstPercent" placeholder="GST %" value={form.gstPercent} onChange={handleChange} />

        <h3>Nutrition</h3>
        <input type="number" name="nutrition.calories" placeholder="Calories" value={form.nutrition.calories} onChange={handleChange} />
        <input type="number" name="nutrition.protein" placeholder="Protein" value={form.nutrition.protein} onChange={handleChange} />
        <input type="number" name="nutrition.fat" placeholder="Fat" value={form.nutrition.fat} onChange={handleChange} />
        <input type="number" name="nutrition.carbs" placeholder="Carbs" value={form.nutrition.carbs} onChange={handleChange} />

        <button onClick={calculatePrice} style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6 }}>
          Calculate Final MRP
        </button>

        <h2>Final Price: ₹{finalPrice.toFixed(2)}</h2>
      </div>
    </div>
  );
}
