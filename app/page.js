"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
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
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506806732259-39c2d0268443')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        fontFamily: "'Georgia', serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: isDark
            ? "rgba(40, 25, 10, 0.85)"
            : "rgba(255, 248, 235, 0.85)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: isDark ? "#f5f5dc" : "#3e2c1c",
          padding: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "60px",
            marginBottom: "20px",
            letterSpacing: "2px",
          }}
        >
          Welcome to Native
        </h1>

        <p
          style={{
            fontSize: "22px",
            maxWidth: "600px",
            marginBottom: "30px",
          }}
        >
          Refined from the source. Authentic Indian products crafted with purity,
          tradition and trust.
        </p>

        <button
          style={{
            padding: "14px 32px",
            fontSize: "18px",
            borderRadius: "30px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#8b5e3c",
            color: "#fff",
            transition: "0.3s",
          }}
        >
          Explore Products
        </button>
      </div>
    </main>
  );
}
