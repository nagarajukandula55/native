"use client";

import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
      }
    }

    checkAuth();
  }, []);

  return user;
}
