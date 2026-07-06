"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";

const NAV = [
  { href: "/vendor/dashboard", label: "Dashboard" },
  { href: "/vendor/products", label: "Products" },
  { href: "/vendor/orders", label: "Orders" },
];

/**
 * Guard for the vendor dashboard suite. A "vendor" here is any signed-in
 * user whose role is vendor (or an admin previewing the area). Anyone
 * else gets sent to /sell to apply.
 */
export default function VendorLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useUser();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname || "/vendor/dashboard")}`);
      return;
    }

    const allowed = [
      "vendor",
      "admin",
      "super_admin",
      "super-admin",
      "superadmin",
    ].includes((user.role || "").toLowerCase());

    if (!allowed) {
      router.push("/sell");
      return;
    }

    setChecked(true);
  }, [user, loading, pathname, router]);

  if (loading || !checked) {
    return <p style={{ padding: 40 }}>Loading vendor dashboard...</p>;
  }

  return (
    <div className="wrap">
      <aside className="side">
        <h3>Vendor Panel</h3>
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={pathname === n.href ? "link active" : "link"}
          >
            {n.label}
          </Link>
        ))}
      </aside>

      <div className="content">{children}</div>

      <style jsx>{`
        .wrap {
          display: flex;
          max-width: 1300px;
          margin: 0 auto;
          min-height: 60vh;
        }
        .side {
          width: 220px;
          padding: 30px 20px;
          border-right: 1px solid #eee;
        }
        .side h3 {
          margin: 0 0 20px;
          font-size: 15px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .link {
          display: block;
          padding: 10px 12px;
          border-radius: 8px;
          color: #333;
          text-decoration: none;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .link.active {
          background: #c28b45;
          color: #fff;
        }
        .content {
          flex: 1;
          padding: 30px;
        }
        @media (max-width: 800px) {
          .wrap {
            flex-direction: column;
          }
          .side {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #eee;
            display: flex;
            gap: 8px;
            padding: 16px;
            overflow-x: auto;
          }
          .side h3 {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
