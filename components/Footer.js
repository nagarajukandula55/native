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
        gap: "20px", // reduced from 30px
        position: "relative",
        zIndex: 1
      }}
    >
      {/* LEFT SECTION: FSSAI + Socials */}
      <div
        style={{
          flex: "1 1 180px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          minWidth: "160px"
        }}
      >
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
            License No: 20126021000129
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px", // reduced gap between icons
            alignItems: "center",
            marginTop: "8px"
          }}
        >
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <img src="/icons/facebook.svg" alt="Facebook" width={24} height={24} />
          </a>
          <a href="https://instagram.com/native_foodstore" target="_blank" rel="noopener noreferrer">
            <img src="/icons/instagram.svg" alt="Instagram" width={24} height={24} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <img src="/icons/twitter.svg" alt="Twitter" width={24} height={24} />
          </a>
        </div>
      </div>

      {/* CENTER SECTION: Brand */}
      <div
        style={{
          flex: "1 1 250px",
          textAlign: "center",
          minWidth: "200px",
          marginTop: "10px",
          marginBottom: "10px"
        }}
      >
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>Native</h2>
        <p style={{ margin: "5px 0", fontSize: "14px", color: "#ddd" }}>
          Eat Healthy, Stay Healthy
        </p>
        <p style={{ margin: "5px 0", fontSize: "12px", color: "#aaa" }}>
          © {new Date().getFullYear()} Native. All rights reserved.
        </p>
      </div>

      {/* RIGHT SECTION 1: Sitemap */}
      <div
        style={{
          flex: "1 1 140px", // reduced width
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          minWidth: "140px"
        }}
      >
        <h3
          style={{
            marginBottom: "10px",
            fontSize: "16px",
            borderBottom: "1px solid #555",
            paddingBottom: "5px"
          }}
        >
          Sitemap
        </h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "14px", lineHeight: "1.6" }}>
          <li>
            <Link href="/" className="footer-link">Home</Link>
          </li>
          <li>
            <Link href="/products" className="footer-link">Products</Link>
          </li>
          <li>
            <Link href="/about" className="footer-link">About Us</Link>
          </li>
          <li>
            <Link href="/contact" className="footer-link">Contact</Link>
          </li>
        </ul>
      </div>

      {/* RIGHT SECTION 2: Contact */}
      <div
        style={{
          flex: "1 1 140px", // reduced width
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          minWidth: "140px"
        }}
      >
        <h3
          style={{
            marginBottom: "10px",
            fontSize: "16px",
            borderBottom: "1px solid #555",
            paddingBottom: "5px"
          }}
        >
          Contact Us
        </h3>
        <p style={{ fontSize: "14px", margin: "3px 0" }}>
          Email: <a href="mailto:care@shopnative.in" style={{ color: "#c28b45" }}>care@shopnative.in</a>
        </p>
        <p style={{ fontSize: "14px", margin: "3px 0" }}>
          WhatsApp: <a href="https://wa.me/918985229693" target="_blank" rel="noopener noreferrer" style={{ color: "#c28b45" }}>+91 89852 29693</a>
        </p>
      </div>

      {/* Footer link hover style */}
      <style jsx>{`
        .footer-link {
          color: #ddd;
          transition: 0.3s;
        }
        .footer-link:hover {
          color: #c28b45;
        }

        @media (max-width: 1024px) {
          footer {
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          footer {
            flex-direction: column;
            align-items: center;
          }
          footer > div {
            text-align: center;
            align-items: center;
          }
        }
      `}</style>
    </footer>
  )
}
