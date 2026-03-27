"use client";

import { useState } from "react";

export default function AutoBranding() {
  const [productName, setProductName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [generatedLabel, setGeneratedLabel] = useState(null);
  const [generatedNutrition, setGeneratedNutrition] = useState(null);
  const [generatedPrice, setGeneratedPrice] = useState(null);
  const [socialPost, setSocialPost] = useState("");
  const [loading, setLoading] = useState(false);

  const generateBranding = async () => {
    if (!productName || !ingredients) return alert("Enter product name and ingredients");
    setLoading(true);

    // 1️⃣ Call API for AI label + nutrition
    const res = await fetch("/api/branding/auto-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName, ingredients, quantity }),
    });
    const data = await res.json();

    if (data.success) {
      setGeneratedLabel(data.label);
      setGeneratedNutrition(data.nutrition);
      setGeneratedPrice(data.price);
      setSocialPost(data.socialPost);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Automated Branding Generator</h1>

      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <textarea
          placeholder="Ingredients (comma separated)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          rows={3}
          cols={50}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      <button onClick={generateBranding} disabled={loading}>
        {loading ? "Generating..." : "Generate Branding"}
      </button>

      {generatedLabel && (
        <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 15 }}>
          <h2>Generated Label</h2>
          <p><strong>Name:</strong> {generatedLabel.name}</p>
          <p><strong>SKU:</strong> {generatedLabel.sku}</p>
          <p><strong>Size:</strong> {generatedLabel.size}</p>
          <p><strong>Quality:</strong> {generatedLabel.quality}</p>
          <p><strong>Price:</strong> ₹{generatedPrice}</p>

          <h3>Nutrition</h3>
          <p>Calories: {generatedNutrition.calories}</p>
          <p>Protein: {generatedNutrition.protein}g</p>
          <p>Fat: {generatedNutrition.fat}g</p>
          <p>Carbs: {generatedNutrition.carbs}g</p>

          <h3>Suggested Social Post</h3>
          <p>{socialPost}</p>
        </div>
      )}
    </div>
  );
}
