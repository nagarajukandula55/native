"use client";

import Link from "next/link";
import { useState } from "react";

export default function BrandingDashboard() {
  const [active, setActive] = useState("labels");

  const menu = [
    { name: "Labels", key: "labels", href: "/branding/labels" },
    { name: "Nutrition / Pricing", key: "nutrition", href: "/branding/nutrition-calculator" },
    { name: "Social Media Posts", key: "social", href: "/branding/social-posts" },
    { name: "Assets", key: "assets", href: "/branding/assets" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={sidebar}>
        {menu.map((item) => (
          <Link key={item.key} href={item.href} style={link(active === item.key)}>
            {item.name}
          </Link>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 20 }}>
        <h1>Branding Dashboard</h1>
        <p>Use the sidebar to navigate modules.</p>
      </div>
    </div>
  );
}

const sidebar = {
  width: "220px",
  borderRight: "1px solid #ddd",
  display: "flex",
  flexDirection: "column",
  padding: 20,
};

const link = (active) => ({
  marginBottom: 10,
  color: active ? "#2563eb" : "#333",
  textDecoration: "none",
  fontWeight: active ? 600 : 400,
});
