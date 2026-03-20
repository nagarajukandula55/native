import { cookies } from "next/headers";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const token = cookies().get("adminToken");
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState({});

  if (!token) redirect("/admin/login");

  const toggle = (section) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div style={wrapper}>
      {/* SIDEBAR */}
      <aside style={sidebar}>
        <h2 style={{ marginBottom: 30, fontSize: 20 }}>🚀 ADMIN ERP</h2>

        <Section title="Commerce" collapsed={collapsed.commerce} toggle={() => toggle("commerce")}>
          <NavLink href="/admin/orders" active={pathname.startsWith("/admin/orders")}>Orders</NavLink>
          <NavLink href="/admin/products" active={pathname.startsWith("/admin/products")}>Products</NavLink>
          <NavLink href="/admin/customers" active={pathname.startsWith("/admin/customers")}>Customers</NavLink>
        </Section>

        <Section title="Warehouse" collapsed={collapsed.warehouse} toggle={() => toggle("warehouse")}>
          <NavLink href="/admin/warehouses" active={pathname.startsWith("/admin/warehouses")}>Manage Warehouses</NavLink>
          <NavLink href="/admin/warehouses/create" active={pathname.startsWith("/admin/warehouses/create")}>Create Warehouse</NavLink>
        </Section>

        <Section title="Inventory" collapsed={collapsed.inventory} toggle={() => toggle("inventory")}>
          <NavLink href="/admin/skus" active={pathname.startsWith("/admin/skus")}>SKU Master</NavLink>
          <NavLink href="/admin/inventory" active={pathname.startsWith("/admin/inventory")}>Stock</NavLink>
        </Section>

        <Section title="Reports" collapsed={collapsed.reports} toggle={() => toggle("reports")}>
          <NavLink href="/admin/analytics" active={pathname.startsWith("/admin/analytics")}>Analytics</NavLink>
          <NavLink href="/admin/reports/sales" active={pathname.startsWith("/admin/reports/sales")}>Sales Report</NavLink>
          <NavLink href="/admin/reports/inventory" active={pathname.startsWith("/admin/reports/inventory")}>Inventory Report</NavLink>
        </Section>

        <Section title="Settings" collapsed={collapsed.settings} toggle={() => toggle("settings")}>
          <NavLink href="/admin/settings/general" active={pathname.startsWith("/admin/settings/general")}>General</NavLink>
          <NavLink href="/admin/settings/payments" active={pathname.startsWith("/admin/settings/payments")}>Payments</NavLink>
          <NavLink href="/admin/settings/notifications" active={pathname.startsWith("/admin/settings/notifications")}>Notifications</NavLink>
        </Section>

        <div style={{ marginTop: "auto" }}>
          <NavLink href="/admin/logout" active={pathname.startsWith("/admin/logout")}>Logout</NavLink>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={content}>{children}</main>
    </div>
  );
}

/* COMPONENTS */

function Section({ title, children, collapsed, toggle }) {
  return (
    <div style={{ marginBottom: 25 }}>
      <div
        onClick={toggle}
        style={{
          ...sectionTitle,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
        ...link,
        backgroundColor: active ? "#1e40af" : "transparent",
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </Link>
  );
}

/* STYLES */

const wrapper = {
  display: "flex",
  minHeight: "100vh",
  fontFamily: "Inter, Arial",
};

const sidebar = {
  width: 280,
  background: "#0f172a",
  color: "#fff",
  padding: 25,
  display: "flex",
  flexDirection: "column",
};

const sectionTitle = {
  fontSize: 12,
  opacity: 0.7,
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: 1.5,
};

const link = {
  color: "#e5e7eb",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 6,
  transition: "all 0.2s",
};

const content = {
  flex: 1,
  background: "#f1f5f9",
  padding: 30,
  overflowX: "auto",
};
