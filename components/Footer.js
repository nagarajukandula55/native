"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer
      style={{
        background: "#3a2a1c",
        color: "#fff",
        padding: "40px 20px",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
        position: "relative",
        zIndex: 1
      }}
    >
      {/* LEFT SECTION */}
      <div
        style={{
          flex: "1 1 250px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          minWidth: "200px"
        }}
      >
        {/* FSSAI */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <img
            src="/fssai-logo.png"
            alt="FSSAI Logo"
            style={{
              width: "120px",
              height: "auto",
              filter: "brightness(0) invert(1)"
            }}
          />
          <span style={{ fontSize: "14px", color: "#ccc" }}>
            FSSAI License No: 20126021000129
          </span>
        </div>

        {/* Social Media */}
        <div style={{ display: "flex", gap: "15px", alignItems: "center", marginTop: "10px" }}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <img
              src="/icons/facebook.svg"
              alt="Facebook"
              width={24}
              height={24}
              style={{ transition: "0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.filter = "brightness(1.5)")}
              onMouseOut={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <img
              src="/icons/instagram.svg"
              alt="Instagram"
              width={24}
              height={24}
              style={{ transition: "0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.filter = "brightness(1.5)")}
              onMouseOut={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <img
              src="/icons/twitter.svg"
              alt="Twitter"
              width={24}
              height={24}
              style={{ transition: "0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.filter = "brightness(1.5)")}
              onMouseOut={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            />
          </a>
        </div>
      </div>

      {/* CENTER SECTION */}
      <div
        style={{
          flex: "1 1 300px",
          textAlign: "center",
          minWidth: "200px",
          marginTop: "20px",
          marginBottom: "20px"
        }}
      >
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>Native</h2>
        <p style={{ margin: "5px 0", fontSize: "14px", color: "#ddd" }}>Eat Healthy, Stay Healthy</p>
        <p style={{ margin: "5px 0", fontSize: "12px", color: "#aaa" }}>
          © {new Date().getFullYear()} Native. All rights reserved.
        </p>
      </div>

      {/* RIGHT SECTION */}
      <div
        style={{
          flex: "1 1 250px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          minWidth: "200px"
        }}
      >
        {/* Sitemap */}
        <div>
          <h3 style={{ marginBottom: "10px", fontSize: "16px", borderBottom: "1px solid #555", paddingBottom: "5px" }}>Sitemap</h3>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              fontSize: "14px",
              lineHeight: "1.8"
            }}
          >
            <li>
              <Link href="/" style={{ color: "#ddd", transition: "0.3s" }} className="footer-link">Home</Link>
            </li>
            <li>
              <Link href="/products" style={{ color: "#ddd", transition: "0.3s" }} className="footer-link">Products</Link>
            </li>
            <li>
              <Link href="/about" style={{ color: "#ddd", transition: "0.3s" }} className="footer-link">About Us</Link>
            </li>
            <li>
              <Link href="/contact" style={{ color: "#ddd", transition: "0.3s" }} className="footer-link">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 style={{ marginBottom: "10px", fontSize: "16px", borderBottom: "1px solid #555", paddingBottom: "5px" }}>Contact Us</h3>
          <p style={{ fontSize: "14px", margin: "3px 0" }}>
            Email:{" "}
            <a href="mailto:care@shopnative.in" style={{ color: "#c28b45" }}>care@shopnative.in</a>
          </p>
          <p style={{ fontSize: "14px", margin: "3px 0" }}>
            WhatsApp:{" "}
            <a href="https://wa.me/918985229693" target="_blank" rel="noopener noreferrer" style={{ color: "#c28b45" }}>
              +91 89852 29693
            </a>
          </p>
        </div>
      </div>

      {/* Global footer link hover style */}
      <style jsx>{`
        .footer-link:hover {
          color: #c28b45;
        }
      `}</style>
    </footer>
  )
}
