"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // 🔥 WAIT

    if (!user) {
      router.replace("/login");
    } else if (!["admin", "super_admin"].includes(user.role)) {
      router.replace("/");
    }
  }, [user, loading]);

  // 🔥 CRITICAL: block UI until auth resolved
  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading dashboard...</p>;
  }

  return children;
}
