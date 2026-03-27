"use client";

import { useState } from "react";

export default function ExportLabel() {
  const [labelName, setLabelName] = useState("Sample Label");
  const [price, setPrice] = useState(100);
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Label: ${labelName}`, 10, 20);
    doc.text(`Price: ₹${price}`, 10, 30);
    doc.text(`Nutrition: Calories ${nutrition.calories}, Protein ${nutrition.protein}g, Fat ${nutrition.fat}g, Carbs ${nutrition.carbs}g`, 10, 40);
    doc.save(`${labelName}.pdf`);
  };

  return (
    <div>
      <h1>Export Label / PDF</h1>
      <input placeholder="Label Name" value={labelName} onChange={e => setLabelName(e.target.value)} />
      <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
      <button onClick={generatePDF} style={{ marginTop: 10 }}>Download PDF</button>
    </div>
  );
}
