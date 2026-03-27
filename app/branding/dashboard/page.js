"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BrandingDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (!data.success || data.user.role !== "branding") {
        router.push("/login");
      } else {
        setLoading(false);
      }
    }
    checkRole();
  }, []);

  if (loading) return <p>Loading Branding Dashboard...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Branding Dashboard</h1>
      <p>Manage Labels, Social Media Posts, Nutrition & Price Calculators here</p>
      {/* TODO: Add links/buttons to Labels, Logo, Social Posts */}
    </div>
  );
}
