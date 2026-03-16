export default function Footer() {
  return (
    <footer
      style={{
        background: "#3a2a1c",
        color: "#fff",
        padding: "40px 20px",
        marginTop: "80px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          maxWidth: "1200px",
          margin: "auto",
          gap: "20px",
        }}
      >
        {/* Left Column */}
        <div style={{ flex: "1 1 200px", textAlign: "center" }}>
          <img
            src="/fssai-logo.png"
            alt="FSSAI Logo"
            style={{ width: "80px", marginBottom: "10px" }}
          />
          <p style={{ marginBottom: "15px" }}>License: 20126021000129</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <img src="/icons/facebook.svg" alt="Facebook" width={24} height={24} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <img src="/icons/instagram.svg" alt="Instagram" width={24} height={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <img src="/icons/twitter.svg" alt="Twitter" width={24} height={24} />
            </a>
          </div>
        </div>

        {/* Center Column */}
        <div style={{ flex: "1 1 200px", textAlign: "center" }}>
          <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>Native</h3>
          <p>Eat Healthy, Stay Healthy</p>
        </div>

        {/* Right Column (Sitemap / Quick Links) */}
        <div style={{ flex: "1 1 200px", textAlign: "center" }}>
          <h4 style={{ marginBottom: "10px" }}>Sitemap</h4>
          <p><a href="/" className="sitemap-link">Home</a></p>
          <p><a href="/products" className="sitemap-link">Products</a></p>
          <p><a href="/track" className="sitemap-link">Track Order</a></p>
          <p><a href="/contact" className="sitemap-link">Contact</a></p>
        </div>
      </div>

      {/* Bottom Section */}
      <p
        style={{
          fontSize: "14px",
          textAlign: "center",
          borderTop: "1px solid #555",
          paddingTop: "15px",
          marginTop: "30px",
        }}
      >
        © {new Date().getFullYear()} Native. All rights reserved.
      </p>

      {/* Hover & Responsive Styles */}
      <style jsx>{`
        .sitemap-link {
          color: #fff;
          text-decoration: none;
          position: relative;
          transition: color 0.3s;
        }
        .sitemap-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -2px;
          height: 2px;
          width: 0;
          background: #c28b45;
          transition: width 0.3s;
        }
        .sitemap-link:hover {
          color: #c28b45;
        }
        .sitemap-link:hover::after {
          width: 100%;
        }

        .social-link img {
          transition: transform 0.3s;
        }
        .social-link:hover img {
          transform: scale(1.2);
        }

        @media (max-width: 900px) {
          footer div {
            flex-direction: column;
            text-align: center;
          }
          footer div > div {
            margin-bottom: 25px;
          }
        }
      `}</style>
    </footer>
  )
}
