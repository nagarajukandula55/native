"use client"

import Link from "next/link"
import { useCart } from "@/context/CartContext"

export default function Navbar() {

  const { cart } = useCart()

  return (

    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 40px",
        borderBottom: "1px solid #eee",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}
    >

      {/* LOGO */}

      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img
          src="/logo.png"
          alt="Native"
          style={{ height: "50px", width: "50px", objectFit: "contain" }}
        />

        <span
          style={{
            fontSize: "22px",
            fontWeight: "600",
            color: "#3a2a1c"
          }}
        >
          Native
        </span>
      </Link>


      {/* NAVIGATION */}

      <nav
        style={{
          display: "flex",
          gap: "30px",
          alignItems: "center"
        }}
      >

        <Link href="/">Home</Link>

        <Link href="/cart">
          Cart ({cart.length})
        </Link>

        <Link href="/login">
          Login
        </Link>

      </nav>

    </header>
  )
}
