"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/an-sdk/auth";
import AdminSidebar from "@/components/AdminSidebar";

// NOTE: "super_admin" (underscore) is the role string actually used
// elsewhere in this codebase (see app/super-admin/users/page.js's role
// picker) — kept alongside the hyphenated/no-separator variants in case
// AN group's backend normalizes it differently.
const ADMIN_ROLES = ["admin", "super_admin", "super-admin", "superadmin", "owner"];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const user = await getMe();

      // NOTE: exact admin role/permission field name is TBD on the AN
      // group's side (see FRONTEND_GAPS.md). Best-effort check: user must
      // exist and have one of the recognized admin-ish roles. "vendor" and
      // "customer" are deliberately excluded now that both are real roles.
      const isAdminish = !!user && ADMIN_ROLES.includes((user.role || "").toLowerCase());

      if (cancelled) return;

      if (!isAdminish) {
        router.push("/login?next=/admin");
      } else {
        setAllowed(true);
      }

      setChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking) {
    return <p style={{ padding: 20 }}>Checking access...</p>;
  }

  if (!allowed) {
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: 24, overflowX: "auto" }}>{children}</div>
    </div>
  );
}
