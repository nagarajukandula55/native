"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminGuard({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/admin/login");
  }, []);

  return <>{children}</>;
}
