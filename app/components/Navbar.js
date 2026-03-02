"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { cart } = useCart();

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
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
      <Link href="/">
        <img src="/logo.png" alt="Native" style={{ height: "75px" }} />
      </Link>

      <div style={{ display: "flex", gap: "40px" }}>
        <Link href="/">Home</Link>
        <Link href="/products">Products</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>

        <Link
          href="/cart"
          style={{
            background: "#8b5e3c",
            color: "#fff",
            padding: "8px 18px",
            borderRadius: "6px",
          }}
        >
          Cart 🛒 ({totalItems})
        </Link>
      </div>
    </nav>
  );
}
