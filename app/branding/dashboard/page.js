"use client";

import { useState } from "react";
import LabelsPage from "../labels/page";
import NutritionCalculatorPage from "../nutrition-calculator/page";
import SocialPostsPage from "../social-posts/page";
import AssetsPage from "../assets/page";

export default function BrandingDashboard() {
  const [activeModule, setActiveModule] = useState("labels");

  const renderModule = () => {
    switch (activeModule) {
      case "labels":
        return <LabelsPage />;
      case "nutrition":
        return <NutritionCalculatorPage />;
      case "social":
        return <SocialPostsPage />;
      case "assets":
        return <AssetsPage />;
      default:
        return <LabelsPage />;
    }
  };

  return (
    <div style={container}>
      <aside style={sidebar}>
        <h2>Branding Dashboard</h2>
        <nav>
          <button style={sidebarBtn} onClick={() => setActiveModule("labels")}>
            Labels
          </button>
          <button style={sidebarBtn} onClick={() => setActiveModule("nutrition")}>
            Nutrition Calculator
          </button>
          <button style={sidebarBtn} onClick={() => setActiveModule("social")}>
            Social Posts
          </button>
          <button style={sidebarBtn} onClick={() => setActiveModule("assets")}>
            Assets & Templates
          </button>
        </nav>
      </aside>

      <main style={main}>{renderModule()}</main>
    </div>
  );
}

/* ===== STYLES ===== */
const container = {
  display: "flex",
  minHeight: "100vh",
  fontFamily: "sans-serif",
};

const sidebar = {
  width: "250px",
  background: "#111",
  color: "#fff",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const sidebarBtn = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  textAlign: "left",
  borderRadius: "6px",
};

const main = {
  flex: 1,
  padding: "30px",
  background: "#f9f9f9",
};
