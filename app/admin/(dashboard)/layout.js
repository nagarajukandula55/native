import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"

export default function AdminLayout({ children }) {

  const token = cookies().get("adminToken")

  if (!token) redirect("/admin/login")

  return (
    <div style={wrapper}>

      {/* SIDEBAR */}
      <aside style={sidebar}>

        <h2 style={{ marginBottom: 30 }}>🚀 ADMIN ERP</h2>

        {/* COMMERCE */}
        <Section title="Commerce">
          <NavLink href="/admin/orders">Orders</NavLink>
          <NavLink href="/admin/products">Products</NavLink>
          <NavLink href="/admin/customers">Customers</NavLink>
        </Section>

        {/* WAREHOUSE */}
        <Section title="Warehouse">
          <NavLink href="/admin/warehouses">Manage Warehouses</NavLink>
          <NavLink href="/admin/warehouses/create">Create Warehouse</NavLink>
        </Section>

        {/* INVENTORY */}
        <Section title="Inventory">
          <NavLink href="/admin/skus">SKU Master</NavLink>
          <NavLink href="/admin/inventory">Stock</NavLink>
        </Section>

        {/* REPORTS */}
        <Section title="Reports">
          <NavLink href="/admin/analytics">Analytics</NavLink>
        </Section>

        <div style={{ marginTop: "auto" }}>
          <NavLink href="/admin/logout">Logout</NavLink>
        </div>

      </aside>

      {/* MAIN */}
      <main style={content}>
        {children}
      </main>

    </div>
  )
}


/* COMPONENTS */

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 25 }}>
      <div style={sectionTitle}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {children}
      </div>
    </div>
  )
}

function NavLink({ href, children }) {
  return (
    <Link href={href} style={link}>
      {children}
    </Link>
  )
}


/* STYLES */

const wrapper = {
  display: "flex",
  minHeight: "100vh",
  fontFamily: "Inter, Arial"
}

const sidebar = {
  width: 260,
  background: "#0f172a",
  color: "#fff",
  padding: 25,
  display: "flex",
  flexDirection: "column"
}

const sectionTitle = {
  fontSize: 11,
  opacity: 0.5,
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: 1.5
}

const link = {
  color: "#e5e7eb",
  textDecoration: "none",
  padding: "9px 12px",
  borderRadius: 8,
  background: "transparent"
}

const content = {
  flex: 1,
  background: "#f1f5f9",
  padding: 30
}
