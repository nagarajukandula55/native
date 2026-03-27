"use client";

import Link from "next/link";
import { useState } from "react";

export default function BrandingDashboard() {
  const [menuOpen, setMenuOpen] = useState(true);

  const sidebarLinks = [
    { name: "Labels", href: "/branding/labels" },
    { name: "Nutrition & Pricing", href: "/branding/nutrition-calculator" },
    { name: "Social Media Posts", href: "/branding/social-posts" },
    { name: "Assets / Logos", href: "/branding/assets" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: menuOpen ? 250 : 60, background: "#111", color: "#fff", transition: "width 0.3s" }}>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ margin: 10, padding: 5 }}>
          {menuOpen ? "Close" : "Open"}
        </button>
        <nav>
          {sidebarLinks.map((link) => (
            <Link key={link.href} href={link.href} style={{ display: "block", padding: 15, color: "#fff", textDecoration: "none" }}>
              {menuOpen ? link.name : link.name.charAt(0)}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 20, background: "#f9f9f9" }}>
        <h1>Branding Dashboard</h1>
        <p>Manage labels, pricing, nutrition, social posts, and assets all in one place.</p>
      </main>
    </div>
  );
}
