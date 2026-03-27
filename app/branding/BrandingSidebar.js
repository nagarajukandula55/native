"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function BrandingSidebar({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState({});

  const toggle = (section) =>
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));

  return (
    <div style={wrapper}>
      <aside style={sidebar}>
        <h2 style={{ marginBottom: 30, fontSize: 20 }}>🎨 BRANDING</h2>

        {/* Labels */}
        <Section
          title="Labels"
          collapsed={collapsed.labels}
          toggle={() => toggle("labels")}
        >
          <NavLink
            href="/branding/labels/create"
            active={pathname.startsWith("/branding/labels/create")}
          >
            Create Label
          </NavLink>
          <NavLink
            href="/branding/labels"
            active={pathname.startsWith("/branding/labels")}
          >
            View Labels
          </NavLink>
        </Section>

        {/* Greetings / Social */}
        <Section
          title="Greetings & Posts"
          collapsed={collapsed.greetings}
          toggle={() => toggle("greetings")}
        >
          <NavLink
            href="/branding/greetings/create"
            active={pathname.startsWith("/branding/greetings/create")}
          >
            Create Greeting
          </NavLink>
          <NavLink
            href="/branding/greetings"
            active={pathname.startsWith("/branding/greetings")}
          >
            View Greetings
          </NavLink>
        </Section>

        {/* Calculators */}
        <Section
          title="Calculators"
          collapsed={collapsed.calculators}
          toggle={() => toggle("calculators")}
        >
          <NavLink
            href="/branding/calculators/nutrition"
            active={pathname.startsWith("/branding/calculators/nutrition")}
          >
            Nutrition
          </NavLink>
          <NavLink
            href="/branding/calculators/price"
            active={pathname.startsWith("/branding/calculators/price")}
          >
            Price
          </NavLink>
        </Section>

        <div style={{ marginTop: "auto" }}>
          <NavLink href="/logout" active={pathname.startsWith("/logout")}>
            Logout
          </NavLink>
        </div>
      </aside>

      <main style={content}>{children}</main>
    </div>
  );
}

/* Components */
function Section({ title, children, collapsed, toggle }) {
  return (
    <div style={{ marginBottom: 25 }}>
      <div
        onClick={toggle}
        style={{
          fontSize: 12,
          opacity: 0.7,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {title} <span>{collapsed ? "▶" : "▼"}</span>
      </div>
      {!collapsed && <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{children}</div>}
    </div>
  );
}

function NavLink({ href, children, active }) {
  return (
    <Link
      href={href}
      style={{
        color: active ? "#fff" : "#cbd5e1",
        textDecoration: "none",
        padding: "8px 12px",
        borderRadius: 6,
        fontWeight: active ? 600 : 400,
        backgroundColor: active ? "#1e40af" : "transparent",
      }}
    >
      {children}
    </Link>
  );
}

/* Styles */
const wrapper = {
  display: "flex",
  minHeight: "100vh",
  fontFamily: "Inter, Arial",
  overflow: "hidden",
};

const sidebar = {
  width: 280,
  background: "#0f172a",
  color: "#fff",
  padding: 25,
  display: "flex",
  flexDirection: "column",
  position: "sticky",
  top: 0,
  height: "100vh",
  overflowY: "auto",
};

const content = {
  flex: 1,
  background: "#f1f5f9",
  padding: 30,
  overflowY: "auto",
  height: "100vh",
};
