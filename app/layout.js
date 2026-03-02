export const metadata = {
  title: "Native | Authentic Indian Products",
  description: "Premium Indian traditional products.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "'Georgia', serif" }}>

        {/* Navbar */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "30px 80px",
            backgroundColor: "#f4efe6"
          }}
        >
          <img
            src="/logo.png"
            alt="Native"
            style={{ height: "85px" }}
          />

          <div style={{ display: "flex", gap: "40px", fontSize: "18px" }}>
            <a href="/" style={{ textDecoration: "none", color: "#3a2a1c" }}>
              Home
            </a>
            <a href="/products" style={{ textDecoration: "none", color: "#3a2a1c" }}>
              Products
            </a>
            <a href="/about" style={{ textDecoration: "none", color: "#3a2a1c" }}>
              About
            </a>
            <a href="/contact" style={{ textDecoration: "none", color: "#3a2a1c" }}>
              Contact
            </a>
          </div>
        </nav>

        {children}

      </body>
    </html>
  );
}
