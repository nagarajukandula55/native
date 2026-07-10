"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { subscribeNewsletter } from "@/lib/an-sdk/contact";
import { ApiError } from "@/lib/an-sdk/client";

export default function Footer() {
  const year = new Date().getFullYear();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await subscribeNewsletter(email.trim());
      setStatus("done");
      setEmail("");
    } catch (err) {
      console.error("Newsletter signup failed:", err);
      setStatus(err instanceof ApiError ? "error" : "error");
    }
  }

  return (
    <footer className="footer">
      <div className="cols">
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

        {/* SITEMAP */}
        <div className="col">
          <h3>Sitemap</h3>
          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>
          <Link href="/track">Track Order</Link>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact</Link>
        </div>

        {/* MARKETPLACE */}
        <div className="col">
          <h3>Marketplace</h3>
          <Link href="/sell">Sell on Native</Link>
          <Link href="/orders">My Orders</Link>
          <Link href="/wishlist">Wishlist</Link>
          <Link href="/support">Support</Link>
        </div>

        {/* LEGAL */}
        <div className="col">
          <h3>Legal</h3>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-and-conditions">Terms & Conditions</Link>
          <Link href="/refund-policy">Refund & Cancellation</Link>
          <Link href="/shipping-policy">Shipping Policy</Link>
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

          <form className="newsletter" onSubmit={handleSubscribe}>
            {status === "done" ? (
              <p className="subscribed">You're subscribed — thank you!</p>
            ) : (
              <>
                <input
                  type="email"
                  required
                  placeholder="Your email for offers & updates"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" disabled={status === "loading"}>
                  {status === "loading" ? "..." : "Subscribe"}
                </button>
              </>
            )}
            {status === "error" && (
              <p className="subError">Couldn't subscribe right now — please try again later.</p>
            )}
          </form>
        </div>
      </div>

      {/* BOTTOM COPYRIGHT BAR */}
      <div className="bottomBar">
        <div className="brandRow">
          <h2>Native</h2>
          <span className="tagline">Eat Healthy, Stay Healthy</span>
        </div>
        <span className="divider">—</span>
        <span className="rights">© {year} Native. All rights reserved.</span>
      </div>

      {/* STYLE */}
      <style jsx>{`
        .footer {
          background: #3a2a1c;
          color: #fff;
          padding: 40px 20px 0;
        }

        .cols {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 25px;
          padding-bottom: 32px;
        }

        .col {
          flex: 1;
          min-width: 180px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .bottomBar {
          border-top: 1px solid #5a4028;
          padding: 20px;
          text-align: center;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: baseline;
          justify-content: center;
          gap: 10px;
        }

        .brandRow {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }

        .tagline {
          font-size: 14px;
          color: #ddd;
        }

        .divider {
          color: #5a4028;
        }

        .rights {
          font-size: 13px;
          color: #bbb;
        }

        @media (max-width: 480px) {
          .bottomBar {
            flex-direction: column;
            gap: 6px;
          }
          .divider {
            display: none;
          }
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

        .newsletter {
          margin-top: 6px;
          display: flex;
          gap: 8px;
          justify-content: flex-start;
          flex-wrap: wrap;
        }

        .newsletter input {
          padding: 9px 12px;
          border-radius: 20px;
          border: 1px solid #5a4028;
          background: #4a3524;
          color: #fff;
          font-size: 13px;
          outline: none;
          min-width: 200px;
        }

        .newsletter input::placeholder {
          color: #bbb;
        }

        .newsletter button {
          padding: 9px 18px;
          border-radius: 20px;
          border: none;
          background: #c28b45;
          color: #fff;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }

        .newsletter button:hover {
          background: #a36d32;
        }

        .newsletter button:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .subscribed {
          color: #7cb342;
          font-weight: 600;
          font-size: 13px;
        }

        .subError {
          width: 100%;
          color: #f87171;
          font-size: 12px;
          margin-top: 4px;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .cols {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .col {
            align-items: center;
          }

          .newsletter {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
}
