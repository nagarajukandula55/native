"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  {
    label: "Overview",
    links: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Catalog",
    links: [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/products/list", label: "Product List" },
      { href: "/admin/products/review", label: "Review Queue" },
      { href: "/admin/create", label: "Add Product" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/inventory", label: "Inventory" },
      { href: "/admin/warehouse", label: "Warehouse" },
    ],
  },
  {
    label: "Sales",
    links: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/coupons", label: "Coupons" },
      { href: "/admin/fulfillment", label: "Fulfillment" },
      { href: "/admin/payment", label: "Payment Settings" },
    ],
  },
  {
    label: "Marketplace",
    links: [
      { href: "/admin/vendors", label: "Vendors" },
      { href: "/admin/business", label: "Business Settings" },
    ],
  },
  {
    label: "Company",
    links: [{ href: "/admin/company", label: "Company Info" }],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const linkStyle = (path) => ({
    padding: "9px 12px",
    borderRadius: 6,
    background: pathname === path ? "#1e40af" : "transparent",
    color: "#fff",
    textDecoration: "none",
    fontSize: 14,
  });

  return (
    <aside
      style={{
        width: 240,
        background: "#111827",
        color: "#fff",
        padding: 20,
        overflowY: "auto",
      }}
    >
      <h2 style={{ marginBottom: 20 }}>Admin Panel</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <p
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#6b7280",
                margin: "0 0 6px 4px",
              }}
            >
              {section.label}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {section.links.map((link) => (
                <Link key={link.href} href={link.href} style={linkStyle(link.href)}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <Link href="/admin/logout" style={{ ...linkStyle("/admin/logout"), color: "#f87171" }}>
          Logout
        </Link>
      </nav>
    </aside>
  );
}
