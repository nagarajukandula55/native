"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsDark(hour >= 18 || hour < 6);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#3b2a1d",
        backgroundImage:
          "radial-gradient(circle at center, rgba(90,60,30,0.6), rgba(30,20,10,0.95))",
        color: "#f5e6cc",
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 60px",
        }}
      >
        <img src="/logo.png" alt="Native Logo" style={{ height: "60px" }} />

        <div style={{ display: "flex", gap: "30px", fontSize: "18px" }}>
          <span style={{ cursor: "pointer" }}>Home</span>
          <span style={{ cursor: "pointer" }}>Products</span>
          <span style={{ cursor: "pointer" }}>About</span>
          <span style={{ cursor: "pointer" }}>Contact</span>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
          padding: "0 20px",
        }}
      >
        <h1
          style={{
            fontSize: "64px",
            marginBottom: "20px",
            letterSpacing: "2px",
          }}
        >
          Welcome to Native
        </h1>

        <p
          style={{
            fontSize: "22px",
            maxWidth: "700px",
            margin: "0 auto 40px",
            lineHeight: "1.6",
          }}
        >
          Eat Healthy, Stay Healthy.  
          Refined from the source. Crafted with purity, tradition and trust.
        </p>

        <button
          style={{
            padding: "14px 40px",
            fontSize: "18px",
            borderRadius: "30px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#c28b45",
            color: "#3b2a1d",
            fontWeight: "bold",
          }}
        >
          Explore Products
        </button>
      </div>
    </main>
  );
}
