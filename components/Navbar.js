"use client"

import { useState } from "react"
import CartDrawer from "./CartDrawer"
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

      <Link href="/">
        <img
          src="/logo.png"
          alt="Native"
          style={{
            height: "60px",
            objectFit: "contain"
          }}
        />
      </Link>


      {/* MENU */}

      <nav
        style={{
          display: "flex",
          gap: "30px",
          alignItems: "center",
          fontSize: "16px"
        }}
      >

        <Link href="/">Home</Link>

        <Link href="/products">Products</Link>

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
