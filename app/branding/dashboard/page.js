"use client";

import { useState } from "react";
import LabelsPage from "../labels/page";
import NutritionCalculator from "../nutrition-calculator/page";
import SocialPosts from "../social-posts/page";
import AssetsPage from "../assets/page";

export default function BrandingDashboard() {
  const [activeTab, setActiveTab] = useState("labels");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ===== SIDEBAR ===== */}
      <div style={sidebar}>
        <h2 style={{ color: "#fff", marginBottom: 20 }}>Branding</h2>
        <button style={tabBtn(activeTab === "labels")} onClick={() => setActiveTab("labels")}>Labels</button>
        <button style={tabBtn(activeTab === "nutrition")} onClick={() => setActiveTab("nutrition")}>Nutrition & Pricing</button>
        <button style={tabBtn(activeTab === "social")} onClick={() => setActiveTab("social")}>Social Posts</button>
        <button style={tabBtn(activeTab === "assets")} onClick={() => setActiveTab("assets")}>Assets</button>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ flex: 1, padding: 20 }}>
        {activeTab === "labels" && <LabelsPage />}
        {activeTab === "nutrition" && <NutritionCalculator />}
        {activeTab === "social" && <SocialPosts />}
        {activeTab === "assets" && <AssetsPage />}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const sidebar = {
  width: 220,
  background: "#111",
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const tabBtn = (active) => ({
  background: active ? "#2563eb" : "transparent",
  color: "#fff",
  border: "none",
  padding: "10px 15px",
  textAlign: "left",
  cursor: "pointer",
  borderRadius: 4,
});
