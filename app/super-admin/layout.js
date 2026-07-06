"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMe } from "@/lib/an-sdk/auth";

// Only true super-admins get in here — this is a strictly higher bar than
// /admin. Previously these pages (Create User, Category Manager) had NO
// guard at all: anyone with the URL could open them.
const SUPER_ADMIN_ROLES = ["super_admin", "super-admin", "superadmin"];

const NAV = [
  { href: "/super-admin", label: "Dashboard" },
  { href: "/super-admin/users", label: "Create User" },
  { href: "/super-admin/categories", label: "Categories" },
];

export default function SuperAdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const user = await getMe();
      const isSuperAdmin =
        !!user && SUPER_ADMIN_ROLES.includes((user.role || "").toLowerCase());

      if (cancelled) return;

      if (!isSuperAdmin) {
        router.push("/login?next=/super-admin");
      } else {
        setAllowed(true);
      }
      setChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking) return <p style={{ padding: 20 }}>Checking access...</p>;
  if (!allowed) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 220,
          background: "#111827",
          color: "#fff",
          padding: 20,
        }}
      >
        <h2 style={{ marginBottom: 20, fontSize: 18 }}>Super Admin</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              style={{
                padding: "9px 12px",
                borderRadius: 6,
                background: pathname === n.href ? "#1e40af" : "transparent",
                color: "#fff",
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div style={{ flex: 1, padding: 24, overflowX: "auto" }}>{children}</div>
    </div>
  );
}
