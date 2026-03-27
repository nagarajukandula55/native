"use client";

import { useState } from "react";

export default function NutritionCalculator() {
  const [inputs, setInputs] = useState({
    ingredientsCost: 0,
    laborCost: 0,
    packagingCost: 0,
    gst: 0,
    margin: 0,
  });

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const calculatePrice = () => {
    const totalCost = inputs.ingredientsCost + inputs.laborCost + inputs.packagingCost;
    const priceWithGST = totalCost * (1 + inputs.gst / 100);
    const finalMRP = priceWithGST * (1 + inputs.margin / 100);
    return finalMRP.toFixed(2);
  };

  return (
    <div>
      <h1>Nutrition & Pricing Calculator</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 400 }}>
        {["ingredientsCost","laborCost","packagingCost","gst","margin"].map((field) => (
          <input
            key={field}
            type="number"
            name={field}
            placeholder={field.replace(/([A-Z])/g, " $1")}
            value={inputs[field]}
            onChange={handleChange}
            style={{ padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
          />
        ))}
        <p>Final MRP: ₹{calculatePrice()}</p>
      </div>
    </div>
  );
}
