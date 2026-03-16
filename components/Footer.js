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
        gap: "20px"
      }}
    >
      {/* LEFT SIDE */}
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
          <span style={{ fontSize: "14px" }}>FSSAI License No: 20126021000129</span>
        </div>

        {/* Social Media */}
        <div style={{ display: "flex", gap: "15px", alignItems: "center", marginTop: "10px" }}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <img src="/icons/facebook.svg" alt="Facebook" width={24} height={24} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <img src="/icons/instagram.svg" alt="Instagram" width={24} height={24} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <img src="/icons/twitter.svg" alt="Twitter" width={24} height={24} />
          </a>
        </div>
      </div>

      {/* CENTER */}
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
        <p style={{ margin: "5px 0", fontSize: "14px" }}>Eat Healthy, Stay Healthy</p>
        <p style={{ margin: "5px 0", fontSize: "12px", color: "#ccc" }}>
          © {new Date().getFullYear()} Native. All rights reserved.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div
        style={{
          flex: "1 1 250px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          minWidth: "200px"
        }}
      >
        {/* Sitemap */}
        <div>
          <h3 style={{ marginBottom: "10px", fontSize: "16px" }}>Sitemap</h3>
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
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/products">Products</Link>
            </li>
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 style={{ marginBottom: "10px", fontSize: "16px" }}>Contact Us</h3>
          <p style={{ fontSize: "14px", margin: "3px 0" }}>
            Email:{" "}
            <a href="mailto:care@shopnative.in" style={{ color: "#c28b45" }}>
              care@shopnative.in
            </a>
          </p>
          <p style={{ fontSize: "14px", margin: "3px 0" }}>
            WhatsApp:{" "}
            <a
              href="https://wa.me/918985229693"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#c28b45" }}
            >
              +91 89852 29693
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
