import { cookies } from "next/headers"
import { redirect, usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"

export default function AdminLayout({ children }) {
  const token = cookies().get("adminToken")
  if (!token) redirect("/admin/login")

  return (
    <div style={wrapper}>
      <Sidebar />
      <main style={content}>{children}</main>
    </div>
  )
}

/* ================= SIDEBAR ================= */
function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState({})

  const toggle = (section) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <aside style={sidebar}>
      <h2 style={logo}>🚀 ADMIN ERP</h2>

      {/* COMMERCE */}
      <Section title="Commerce" collapsed={collapsed["commerce"]} toggle={() => toggle("commerce")}>
        <NavLink href="/admin/orders" active={pathname.startsWith("/admin/orders")}>Orders</NavLink>
        <NavLink href="/admin/products" active={pathname.startsWith("/admin/products")}>Products</NavLink>
        <NavLink href="/admin/customers" active={pathname.startsWith("/admin/customers")}>Customers</NavLink>
      </Section>

      {/* WAREHOUSE */}
      <Section title="Warehouse" collapsed={collapsed["warehouse"]} toggle={() => toggle("warehouse")}>
        <NavLink href="/admin/warehouses" active={pathname.startsWith("/admin/warehouses"))}>Manage Warehouses</NavLink>
        <NavLink href="/admin/warehouses/create" active={pathname.startsWith("/admin/warehouses/create")}>Create Warehouse</NavLink>
      </Section>

      {/* INVENTORY */}
      <Section title="Inventory" collapsed={collapsed["inventory"]} toggle={() => toggle("inventory")}>
        <NavLink href="/admin/skus" active={pathname.startsWith("/admin/skus")}>SKU Master</NavLink>
        <NavLink href="/admin/inventory" active={pathname.startsWith("/admin/inventory")}>Stock</NavLink>
      </Section>

      {/* REPORTS */}
      <Section title="Reports" collapsed={collapsed["reports"]} toggle={() => toggle("reports")}>
        <NavLink href="/admin/analytics" active={pathname.startsWith("/admin/analytics")}>Analytics</NavLink>
      </Section>

      {/* SETTINGS */}
      <Section title="Settings" collapsed={collapsed["settings"]} toggle={() => toggle("settings")}>
        <NavLink href="/admin/settings/payment" active={pathname.startsWith("/admin/settings/payment")}>Payment Settings</NavLink>
        <NavLink href="/admin/settings/branding" active={pathname.startsWith("/admin/settings/branding")}>Branding</NavLink>
        <NavLink href="/admin/settings/users" active={pathname.startsWith("/admin/settings/users")}>Admin Users</NavLink>
      </Section>

      {/* LOGOUT */}
      <div style={{ marginTop: "auto" }}>
        <NavLink href="/admin/logout" active={false}>Logout</NavLink>
      </div>
    </aside>
  )
}

/* ================= COMPONENTS ================= */
function Section({ title, children, collapsed, toggle }) {
  return (
    <div style={{ marginBottom: 25 }}>
      <div style={sectionTitle} onClick={toggle}>
        {title} {collapsed ? "▼" : "▲"}
      </div>
      {!collapsed && <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{children}</div>}
    </div>
  )
}

function NavLink({ href, children, active }) {
  return (
    <Link href={href} style={{ ...link, ...(active ? activeLink : {}) }}>
      {children}
    </Link>
  )
}

/* ================= STYLES ================= */
const wrapper = {
  display: "flex",
  minHeight: "100vh",
  fontFamily: "Inter, Arial",
}

const sidebar = {
  width: 260,
  background: "#0f172a",
  color: "#fff",
  padding: 25,
  display: "flex",
  flexDirection: "column",
}

const logo = {
  marginBottom: 30,
  fontSize: 20,
  fontWeight: "bold",
}

const sectionTitle = {
  fontSize: 11,
  opacity: 0.7,
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: 1.5,
  cursor: "pointer",
}

const link = {
  color: "#e5e7eb",
  textDecoration: "none",
  padding: "9px 12px",
  borderRadius: 8,
  background: "transparent",
  fontSize: 13,
}

const activeLink = {
  background: "#1e40af",
  color: "#fff",
  fontWeight: "bold",
}

const content = {
  flex: 1,
  background: "#f1f5f9",
  padding: 30,
}
