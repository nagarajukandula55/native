"use client";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
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

      {/* Hero Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          textAlign: "center",
          paddingTop: "140px",
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
      </div>
    </main>
  );
}
