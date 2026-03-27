"use client";

import { useEffect, useState } from "react";
import LabelsPage from "./labels/page";
import NutritionCalculator from "./nutrition-calculator/page";
import SocialPosts from "./social-posts/page";
import AssetsManager from "./assets/page";

export default function BrandingDashboard() {
  const [tab, setTab] = useState("labels");

  return (
    <div style={{ padding: 20 }}>
      <h1>Branding Dashboard</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setTab("labels")}>Labels</button>
        <button onClick={() => setTab("nutrition")}>Nutrition</button>
        <button onClick={() => setTab("pricing")}>Pricing Calculator</button>
        <button onClick={() => setTab("social")}>Social Media Posts</button>
        <button onClick={() => setTab("assets")}>Assets / Logos</button>
      </div>

      <div style={{ border: "1px solid #ddd", padding: 20 }}>
        {tab === "labels" && <LabelsPage />}
        {tab === "nutrition" && <NutritionCalculator />}
        {tab === "pricing" && <PricingCalculator />}
        {tab === "social" && <SocialPosts />}
        {tab === "assets" && <AssetsManager />}
      </div>
    </div>
  );
}

/* ================= PRICING CALCULATOR COMPONENT ================= */

function PricingCalculator() {
  const [params, setParams] = useState({
    rawMaterial: 0,
    labor: 0,
    packaging: 0,
    marketing: 0,
    transport: 0,
    taxes: 0,
    misc: 0,
  });
  const [total, setTotal] = useState(0);

  const calculatePrice = () => {
    const sum = Object.values(params).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    setTotal(sum);
  };

  return (
    <div>
      <h2>Full Pricing Calculator</h2>

      {Object.keys(params).map((key) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <label style={{ marginRight: 10 }}>{key}:</label>
          <input
            type="number"
            value={params[key]}
            onChange={(e) => setParams({ ...params, [key]: e.target.value })}
          />
        </div>
      ))}

      <button onClick={calculatePrice} style={{ marginTop: 10 }}>Calculate Total Price</button>

      {total > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Final Price: ₹{total.toFixed(2)}</h3>
        </div>
      )}
    </div>
  );
}
