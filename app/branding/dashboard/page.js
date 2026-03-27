"use client";

import Link from "next/link";

// Import your modules (placeholders or actual implementations)
import LabelsPage from "../labels/page";
import NutritionCalculatorPage from "../nutrition-calculator/page";
import SocialPostsPage from "../social-posts/page";
import AssetsPage from "../assets/page";

export default function BrandingDashboard() {
  return (
    <div style={container}>
      <h1>Branding Dashboard</h1>
      <p>Manage everything about your brand, labels, nutrition, pricing, and social posts from here.</p>

      <div style={section}>
        <h2>Labels</h2>
        <LabelsPage />
        <Link href="/branding/labels/create" style={button}>+ Create New Label</Link>
      </div>

      <div style={section}>
        <h2>Nutrition Calculator</h2>
        <NutritionCalculatorPage />
      </div>

      <div style={section}>
        <h2>Social Media Posts</h2>
        <SocialPostsPage />
      </div>

      <div style={section}>
        <h2>Assets & Templates</h2>
        <AssetsPage />
      </div>
    </div>
  );
}

/* ===== STYLES ===== */
const container = {
  padding: "30px",
  maxWidth: "1200px",
  margin: "0 auto",
  fontFamily: "sans-serif",
};

const section = {
  marginTop: "40px",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "10px",
};

const button = {
  display: "inline-block",
  marginTop: "10px",
  padding: "8px 16px",
  background: "#2563eb",
  color: "#fff",
  borderRadius: "6px",
  textDecoration: "none",
};
