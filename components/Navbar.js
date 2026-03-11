
"use client"

import Link from "next/link"
import { useCart } from "@/context/CartContext"

export default function Navbar() {

  const { cart } = useCart()

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  )

  return (

    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 80px",
        borderBottom: "1px solid #eee",
        background: "#fff"
      }}
    >

      <Link
        href="/"
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          textDecoration: "none",
          color: "#3a2a1c"
        }}
      >
        Native
      </Link>


      <div style={{ display: "flex", gap: "30px" }}>

        <Link href="/products">Products</Link>

        <Link href="/cart">
          Cart ({cartCount})
        </Link>

      </div>

    </nav>

  )

}
