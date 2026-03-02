export const metadata = {
  title: "Native | Authentic Indian Products",
  description: "Premium Indian traditional products.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "'Georgia', serif",
          backgroundColor: "#fffdf9",
          color: "#3a2a1c"
        }}
      >
        {/* Navbar */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "25px 80px",
            backgroundColor: "#f4efe6",
            borderBottom: "1px solid #e5dccf"
          }}
        >
          {/* Logo */}
          <a href="/" style={{ textDecoration: "none" }}>
            <img
              src="/logo.png"
              alt="Native"
              style={{ height: "75px" }}
            />
          </a>

          {/* Navigation Links */}
          <div
            style={{
              display: "flex",
              gap: "40px",
              fontSize: "18px",
              fontWeight: "500"
            }}
          >
            <a href="/" style={linkStyle}>Home</a>
            <a href="/products" style={linkStyle}>Products</a>
            <a href="/about" style={linkStyle}>About</a>
            <a href="/contact" style={linkStyle}>Contact</a>
            <a href="/cart" style={cartStyle}>Cart 🛒</a>
          </div>
        </nav>

        {/* Page Content */}
        <main
          style={{
            minHeight: "80vh",
            padding: "60px 80px"
          }}
        >
          {children}
        </main>

        {/* Footer */}
        <footer
          style={{
            backgroundColor: "#f4efe6",
            textAlign: "center",
            padding: "30px",
            fontSize: "14px",
            borderTop: "1px solid #e5dccf"
          }}
        >
          © {new Date().getFullYear()} Native. All Rights Reserved.
        </footer>
      </body>
    </html>
  );
}

const linkStyle = {
  textDecoration: "none",
  color: "#3a2a1c"
};

const cartStyle = {
  textDecoration: "none",
  color: "white",
  backgroundColor: "#8b5e3c",
  padding: "8px 18px",
  borderRadius: "6px"
};
