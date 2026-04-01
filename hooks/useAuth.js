"use client";

import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user/me", {
          credentials: "include", // 🔥 VERY IMPORTANT
        });

        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }

      } catch (err) {
        console.error("Auth error:", err);
        setUser(null);
      }

      setLoading(false);
    }

    fetchUser();
  }, []);

  return { user, loading };
}
