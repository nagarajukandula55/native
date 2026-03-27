"use client";

import { useState } from "react";

export default function NutritionPricePage() {
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fat, setFat] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [price, setPrice] = useState(0);

  const calcNutrition = () => {
    return protein*4 + carbs*4 + fat*9;
  };

  const calcPrice = () => {
    return price; // extend logic for cost + margin etc
  };

  return (
    <div>
      <h1>Nutrition & Price Calculator</h1>
      <div style={{ display:"flex", flexDirection:"column", maxWidth:300, gap:6 }}>
        <input type="number" placeholder="Calories" value={calories} onChange={e=>setCalories(Number(e.target.value))} />
        <input type="number" placeholder="Protein(g)" value={protein} onChange={e=>setProtein(Number(e.target.value))} />
        <input type="number" placeholder="Fat(g)" value={fat} onChange={e=>setFat(Number(e.target.value))} />
        <input type="number" placeholder="Carbs(g)" value={carbs} onChange={e=>setCarbs(Number(e.target.value))} />
        <input type="number" placeholder="Price (₹)" value={price} onChange={e=>setPrice(Number(e.target.value))} />

        <div>
          <p>Total Nutrition Calories (Calculated): {calcNutrition()}</p>
          <p>Price: ₹{calcPrice()}</p>
        </div>
      </div>
    </div>
  );
}
