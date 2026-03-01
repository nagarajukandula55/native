"use client";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f6f1e7",
        fontFamily: "'Georgia', serif",
        color: "#3b2a1d",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "30px 80px",
          backgroundColor: "transparent",
        }}
      >
        <img src="/logo.png" alt="Native" style={{ height: "70px" }} />

        <div style={{ display: "flex", gap: "40px", fontSize: "18px" }}>
          <span style={{ cursor: "pointer" }}>Home</span>
          <span style={{ cursor: "pointer" }}>Products</span>
          <span style={{ cursor: "pointer" }}>About</span>
          <span style={{ cursor: "pointer" }}>Contact</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          textAlign: "center",
          padding: "120px 20px",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "64px",
            marginBottom: "30px",
            fontWeight: "normal",
          }}
        >
          Welcome to Native
        </h1>

        <p
          style={{
            fontSize: "22px",
            lineHeight: "1.8",
            marginBottom: "50px",
            color: "#5a4634",
          }}
        >
          Eat Healthy, Stay Healthy.  
          Authentic Indian products refined from the source —
          crafted with purity, tradition and trust.
        </p>

        <button
          style={{
            padding: "16px 50px",
            fontSize: "18px",
            borderRadius: "50px",
            border: "2px solid #c28b45",
            backgroundColor: "transparent",
            color: "#c28b45",
            cursor: "pointer",
            letterSpacing: "1px",
          }}
        >
          Explore Products
        </button>
      </section>
    </main>
  );
}
