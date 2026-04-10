"use client";

import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    refreshUser: fetchUser,
  };
}
