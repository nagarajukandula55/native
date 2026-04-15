"use client";

import { useEffect, useState, useCallback } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH USER ================= */
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include", // 🔥 REQUIRED for cookies
        cache: "no-store", // 🔥 prevents stale auth
      });

      const data = await res.json();

      if (data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }

    } catch (err) {
      console.error("AUTH ERROR:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /* ================= LOGOUT HELPER ================= */
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("LOGOUT ERROR:", err);
    }

    setUser(null);
  };

  /* ================= RETURN ================= */
  return {
    user,
    loading,
    refreshUser: fetchUser, // 🔥 manual refresh
    logout,
  };
}
