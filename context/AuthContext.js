"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error(err);
      setUser(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
