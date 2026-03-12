"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useCart } from "@/context/CartContext"
import CartDrawer from "./CartDrawer"

export default function Navbar() {

  const { cart } = useCart()

  const [cartOpen, setCartOpen] = useState(false)

  // open cart when product added
  useEffect(() => {

    const openCart = () => setCartOpen(true)

    window.addEventListener("cart-open", openCart)

    return () => {
      window.removeEventListener("cart-open", openCart)
    }

  }, [])

  return (

    <>
    
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
        borderBottom: "1px solid #eee",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        flexWrap:"wrap"
      }}
    >

      {/* LOGO */}

      <Link href="/">

        <img
          src="/logo.png"
          alt="Native"
          style={{
            height: "60px",
            objectFit: "contain",
            cursor:"pointer"
          }}
        />

      </Link>


      {/* MENU */}

      <nav
        style={{
          display: "flex",
          gap: "25px",
          alignItems: "center",
          fontSize: "16px"
        }}
      >

        <Link href="/">Home</Link>

        <Link href="/products">Products</Link>


        {/* CART BUTTON */}

        <button
          onClick={() => setCartOpen(true)}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Cart ({cart.length})
        </button>


        <Link href="/login">
          Login
        </Link>

      </nav>

    </header>

    {/* CART DRAWER */}

    <CartDrawer open={cartOpen} setOpen={setCartOpen} />

    </>
  )

}
