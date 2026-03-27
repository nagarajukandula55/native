"use client";

import LabelsPage from "../labels/page";
import NutritionPricing from "../nutrition-calculator/page";
import SocialPosts from "../social-posts/page";
import AssetsPage from "../assets/page";

export default function BrandingDashboard() {
  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>
      <div style={{ flex: 1 }}>
        <h1>Branding Dashboard</h1>
        <NutritionPricing />
        <LabelsPage />
        <SocialPosts />
        <AssetsPage />
      </div>
    </div>
  );
}
