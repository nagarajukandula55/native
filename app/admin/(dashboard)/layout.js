import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"

export default function AdminLayout({ children }) {

  const token = cookies().get("adminToken")

  if (!token) {
    redirect("/admin/login")
  }

  return (
    <div style={wrapper}>

      {/* SIDEBAR */}
      <aside style={sidebar}>

        <h2 style={{ marginBottom: 30 }}>ADMIN PANEL</h2>

        {/* COMMERCE */}
        <Section title="Commerce">
          <NavLink href="/admin/orders">Orders</NavLink>
          <NavLink href="/admin/products">Products</NavLink>
          <NavLink href="/admin/customers">Customers</NavLink>
        </Section>

        {/* OPERATIONS ERP */}
        <Section title="Operations">
          <Link href="/admin/warehouse/create">Create Warehouse</Link>
          <Link href="/admin/warehouses">Manage Warehouses</Link>
          <NavLink href="/admin/skus">SKUs</NavLink>
          <NavLink href="/admin/inventory">Inventory</NavLink>
        </Section>

        {/* REPORTING */}
        <Section title="Reports">
          <NavLink href="/admin/analytics">Analytics</NavLink>
        </Section>

        <div style={{ marginTop: "auto" }}>
          <NavLink href="/admin/logout">Logout</NavLink>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main style={content}>
        {children}
      </main>

    </div>
  )
}


/* ---------------- COMPONENTS ---------------- */

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 25 }}>
      <div style={sectionTitle}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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


/* ---------------- STYLES ---------------- */

const wrapper = {
  display: "flex",
  minHeight: "100vh",
  fontFamily: "Arial"
}

const sidebar = {
  width: 260,
  background: "#111",
  color: "#fff",
  padding: 25,
  display: "flex",
  flexDirection: "column"
}

const sectionTitle = {
  fontSize: 12,
  opacity: 0.6,
  marginBottom: 10,
  textTransform: "uppercase",
  letterSpacing: 1
}

const link = {
  color: "#fff",
  textDecoration: "none",
  padding: "8px 10px",
  borderRadius: 6
}

const content = {
  flex: 1,
  background: "#f4f6f8",
  padding: 30
}
