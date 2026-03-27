"use client";

import { useState } from "react";

export default function PriceCalculator() {
  const [ingredients, setIngredients] = useState([{ name: "", cost: 0, quantity: 0 }]);
  const [packaging, setPackaging] = useState(0);
  const [labor, setLabor] = useState(0);
  const [marketing, setMarketing] = useState(0);
  const [tax, setTax] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  const calculatePrice = () => {
    let ingredientCost = ingredients.reduce((sum, i) => sum + i.cost * i.quantity, 0);
    let baseCost = ingredientCost + packaging + labor + marketing;
    let priceWithTax = baseCost + (baseCost * tax / 100);
    let priceWithProfit = priceWithTax + (priceWithTax * profitMargin / 100);
    setFinalPrice(priceWithProfit.toFixed(2));
  };

  return (
    <div>
      <h1>Full Price Calculator</h1>

      {ingredients.map((ing, idx) => (
        <div key={idx}>
          <input placeholder="Ingredient" value={ing.name} onChange={(e) => {
            const newArr = [...ingredients]; newArr[idx].name = e.target.value; setIngredients(newArr);
          }} />
          <input type="number" placeholder="Cost per unit" value={ing.cost} onChange={(e) => {
            const newArr = [...ingredients]; newArr[idx].cost = parseFloat(e.target.value); setIngredients(newArr);
          }} />
          <input type="number" placeholder="Quantity" value={ing.quantity} onChange={(e) => {
            const newArr = [...ingredients]; newArr[idx].quantity = parseFloat(e.target.value); setIngredients(newArr);
          }} />
        </div>
      ))}

      <button onClick={() => setIngredients([...ingredients, { name: "", cost: 0, quantity: 0 }])}>Add Ingredient</button>

      <div>
        <input type="number" placeholder="Packaging Cost" value={packaging} onChange={(e) => setPackaging(parseFloat(e.target.value))} />
        <input type="number" placeholder="Labor Cost" value={labor} onChange={(e) => setLabor(parseFloat(e.target.value))} />
        <input type="number" placeholder="Marketing Cost" value={marketing} onChange={(e) => setMarketing(parseFloat(e.target.value))} />
        <input type="number" placeholder="Tax %" value={tax} onChange={(e) => setTax(parseFloat(e.target.value))} />
        <input type="number" placeholder="Profit %" value={profitMargin} onChange={(e) => setProfitMargin(parseFloat(e.target.value))} />
      </div>

      <button onClick={calculatePrice}>Calculate Final Price</button>

      {finalPrice > 0 && <p>Final MRP: ₹{finalPrice}</p>}
    </div>
  );
}
