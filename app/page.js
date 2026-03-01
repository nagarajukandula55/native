"use client";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        fontFamily: "'Georgia', serif",
        backgroundColor: "#f4efe6",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1603046891744-7610fdb6fb3d')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(244, 239, 230, 0.92)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
        }}
      >
        {/* Navbar */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "30px 80px",
          }}
        >
          <img
            src="/logo.png"
            alt="Native"
            style={{ height: "85px" }}
          />

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
            paddingTop: "120px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              fontSize: "70px",
              marginBottom: "25px",
              fontWeight: "normal",
              color: "#3a2a1c",
            }}
          >
            Welcome to Native
          </h1>

          <p
            style={{
              fontSize: "22px",
              lineHeight: "1.8",
              marginBottom: "50px",
              color: "#5c4634",
            }}
          >
            Eat Healthy, Stay Healthy.  
            Authentic Indian products refined from the source —
            crafted with purity, tradition and trust.
          </p>

          <button
            style={{
              padding: "16px 55px",
              fontSize: "18px",
              borderRadius: "50px",
              border: "2px solid #c28b45",
              backgroundColor: "#c28b45",
              color: "#fff",
              cursor: "pointer",
              letterSpacing: "1px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            }}
          >
            Explore Products
          </button>
        </section>
      </div>
    </main>
  );
}
