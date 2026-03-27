"use client";

import { useState } from "react";

export default function NutritionCalculator() {
  const [ingredients, setIngredients] = useState([{ name: "", calories: 0, protein: 0, fat: 0, carbs: 0 }]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, fat: 0, carbs: 0 });

  const calculateNutrition = () => {
    let totals = { calories: 0, protein: 0, fat: 0, carbs: 0 };
    ingredients.forEach(i => {
      totals.calories += i.calories;
      totals.protein += i.protein;
      totals.fat += i.fat;
      totals.carbs += i.carbs;
    });
    setTotals(totals);
  };

  return (
    <div>
      <h1>Nutrition Calculator</h1>

      {ingredients.map((ing, idx) => (
        <div key={idx} style={{ marginBottom: 10 }}>
          <input placeholder="Ingredient" value={ing.name} onChange={e => { const arr=[...ingredients]; arr[idx].name=e.target.value; setIngredients(arr); }} />
          <input type="number" placeholder="Calories" value={ing.calories} onChange={e => { const arr=[...ingredients]; arr[idx].calories=parseFloat(e.target.value); setIngredients(arr); }} />
          <input type="number" placeholder="Protein (g)" value={ing.protein} onChange={e => { const arr=[...ingredients]; arr[idx].protein=parseFloat(e.target.value); setIngredients(arr); }} />
          <input type="number" placeholder="Fat (g)" value={ing.fat} onChange={e => { const arr=[...ingredients]; arr[idx].fat=parseFloat(e.target.value); setIngredients(arr); }} />
          <input type="number" placeholder="Carbs (g)" value={ing.carbs} onChange={e => { const arr=[...ingredients]; arr[idx].carbs=parseFloat(e.target.value); setIngredients(arr); }} />
        </div>
      ))}

      <button onClick={() => setIngredients([...ingredients, { name: "", calories: 0, protein: 0, fat: 0, carbs: 0 }])}>
        Add Ingredient
      </button>

      <div style={{ marginTop: 20 }}>
        <button onClick={calculateNutrition}>Calculate Total Nutrition</button>
      </div>

      {totals.calories > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Totals:</h3>
          <p>Calories: {totals.calories}</p>
          <p>Protein: {totals.protein} g</p>
          <p>Fat: {totals.fat} g</p>
          <p>Carbs: {totals.carbs} g</p>
        </div>
      )}
    </div>
  );
}
