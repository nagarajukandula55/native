"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    // 🔥 TEMP: No auth system active
    // Keep admin accessible during development
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f6f6f6" }}>
      {children}
    </div>
  );
}
