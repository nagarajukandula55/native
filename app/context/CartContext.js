import Link from "next/link";
export const metadata = {
  title: "Native | Authentic Indian Products",
  description: "Premium Indian traditional products.",
};

import { CartProvider } from "./context/CartContext"; // ✅ Correct Named Import

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "'Georgia', serif",
          backgroundColor: "#fffdf9",
          color: "#3a2a1c",
        }}
      >
        <CartProvider>
          {/* Navbar */}
          <nav
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "25px 80px",
              backgroundColor: "#f4efe6",
              borderBottom: "1px solid #e5dccf",
            }}
          >
            <a href="/" style={{ textDecoration: "none" }}>
              <img
                src="/logo.png"
                alt="Native"
                style={{ height: "75px" }}
              />
            </a>

            <div
              style={{
                display: "flex",
                gap: "40px",
                fontSize: "18px",
                fontWeight: "500",
                alignItems: "center",
              }}
            >
              <Link href="/" style={linkStyle}>Home</Link>
              <Link href="/products" style={linkStyle}>Products</Link>
              <Link href="/about" style={linkStyle}>About</Link>
              <Link href="/contact" style={linkStyle}>Contact</Link>
              <Link href="/cart" style={cartStyle}>Cart 🛒</Link>
            </div>
          </nav>

          <main style={{ minHeight: "80vh", padding: "60px 80px" }}>
            {children}
          </main>

          <footer
            style={{
              backgroundColor: "#f4efe6",
              textAlign: "center",
              padding: "30px",
              fontSize: "14px",
              borderTop: "1px solid #e5dccf",
            }}
          >
            © {new Date().getFullYear()} Native. All Rights Reserved.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}

const linkStyle = {
  textDecoration: "none",
  color: "#3a2a1c",
};

const cartStyle = {
  textDecoration: "none",
  color: "white",
  backgroundColor: "#8b5e3c",
  padding: "8px 18px",
  borderRadius: "6px",
};
