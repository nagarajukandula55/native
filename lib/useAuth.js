"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/an-sdk/auth";

export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const me = await getMe();
        if (me) setUser(me);
      } catch (err) {
        console.error(err);
      }
    }

    fetchUser();
  }, []);

  return user;
}
