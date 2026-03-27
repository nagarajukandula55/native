"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BrandingLayout({ children }) {
  const pathname = usePathname();

  const linkStyle = (href) => ({
    display: "block",
    padding: "8px 12px",
    textDecoration: "none",
    color: pathname.startsWith(href) ? "#fff" : "#0f172a",
    backgroundColor: pathname.startsWith(href) ? "#2563eb" : "transparent",
    borderRadius: 6,
    marginBottom: 6,
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 220, padding: 20, background: "#f1f5f9" }}>
        <h2>Branding Manager</h2>
        <Link href="/branding/labels" style={linkStyle("/branding/labels")}>Labels</Link>
        <Link href="/branding/greetings" style={linkStyle("/branding/greetings")}>Greetings</Link>
        <Link href="/branding/nutrition" style={linkStyle("/branding/nutrition")}>Nutrition & Price Calc</Link>
      </aside>
      <main style={{ flex: 1, padding: 30 }}>{children}</main>
    </div>
  );
}
