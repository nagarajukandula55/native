"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();

    // Auto switch based on time
    if (hour >= 18 || hour < 6) {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        transition: "0.4s",
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
        color: isDark ? "#f1f5f9" : "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "Arial"
      }}
    >
      <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>
        ShopNative
      </h1>

      <p style={{ fontSize: "20px", opacity: 0.8 }}>
        Authentic Indian Native Products
      </p>

      <button
        style={{
          marginTop: "30px",
          padding: "12px 24px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          backgroundColor: isDark ? "#38bdf8" : "#0ea5e9",
          color: "white"
        }}
      >
        Explore Products
      </button>
    </main>
  );
}
