"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* LEFT */}
      <div className="col">
        <div className="logoBox">
          <Image
            src="/fssai-logo.png"
            alt="FSSAI Logo"
            width={120}
            height={60}
          />
          <span className="smallText">
            License No: 20126021000129
          </span>
        </div>

        <div className="socials">
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <img src="/icons/facebook.svg" alt="Facebook" width={24} />
          </a>
          <a href="https://instagram.com/native_foodstore" target="_blank" rel="noreferrer">
            <img src="/icons/instagram.svg" alt="Instagram" width={24} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <img src="/icons/twitter.svg" alt="Twitter" width={24} />
          </a>
        </div>
      </div>

      {/* CENTER */}
      <div className="col center">
        <h2>Native</h2>
        <p>Eat Healthy, Stay Healthy</p>
        <span>© {year} Native. All rights reserved.</span>
      </div>

      {/* SITEMAP */}
      <div className="col">
        <h3>Sitemap</h3>
        <Link href="/">Home</Link>
        <Link href="/products">Products</Link>
        <Link href="/about">About Us</Link>
        <Link href="/contact">Contact</Link>
      </div>

      {/* CONTACT */}
      <div className="col">
        <h3>Contact</h3>
        <p>
          Email:{" "}
          <a href="mailto:care@shopnative.in">
            care@shopnative.in
          </a>
        </p>
        <p>
          WhatsApp:{" "}
          <a
            href="https://wa.me/918985229693"
            target="_blank"
            rel="noreferrer"
          >
            +91 89852 29693
          </a>
        </p>
      </div>

      {/* STYLE */}
      <style jsx>{`
        .footer {
          background: #3a2a1c;
          color: #fff;
          padding: 40px 20px;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 25px;
        }

        .col {
          flex: 1;
          min-width: 180px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .center {
          text-align: center;
        }

        .logoBox {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .smallText {
          font-size: 13px;
          color: #ccc;
        }

        .socials {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        a {
          color: #ddd;
          text-decoration: none;
          font-size: 14px;
        }

        a:hover {
          color: #c28b45;
        }

        h2, h3 {
          margin: 0;
        }

        p, span {
          margin: 0;
          font-size: 14px;
          color: #ddd;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .footer {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .col {
            align-items: center;
          }
        }
      `}</style>
    </footer>
  );
}
