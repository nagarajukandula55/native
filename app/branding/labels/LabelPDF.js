"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";

export default function LabelPDF({ label }) {
  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(label.productName, 10, 20);

    doc.setFontSize(12);
    doc.text(`Nutrition: Calories ${label.nutrition.calories}, Protein ${label.nutrition.protein}g, Fat ${label.nutrition.fat}g, Carbs ${label.nutrition.carbs}g`, 10, 30);

    doc.text(label.aiText, 10, 50, { maxWidth: 180 });

    doc.save(`${label.productName}-label.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6 }}
    >
      Download Label PDF
    </button>
  );
}
