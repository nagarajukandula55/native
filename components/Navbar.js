"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useCart } from "@/context/CartContext"
import CartDrawer from "./CartDrawer"

export default function Navbar() {

  const {
    cart,
    drawerOpen,
    openCart,
    closeCart
  } = useCart()

  const router = useRouter()
  const [search,setSearch] = useState("")

  function handleSearch(e){
    e.preventDefault()

    if(!search.trim()) return

    router.push(`/products?search=${search}`)
    setSearch("")
  }

  return (
    <>
      <header
        style={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          padding:"15px 30px",
          borderBottom:"1px solid #eee",
          background:"#fff",
          position:"sticky",
          top:0,
          zIndex:1000,
          flexWrap:"wrap",
          gap:"15px"
        }}
      >

        {/* LOGO */}
        <Link href="/">
          <img
            src="/logo.png"
            alt="Native"
            style={{height:"60px",cursor:"pointer"}}
          />
        </Link>

        {/* SEARCH */}
        <form
          onSubmit={handleSearch}
          style={{display:"flex",gap:"10px"}}
        >
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            style={{
              padding:"8px 15px",
              borderRadius:"20px",
              border:"1px solid #ccc",
              width:"200px"
            }}
          />
        </form>

        {/* MENU */}
        <nav
          style={{
            display:"flex",
            gap:"20px",
            alignItems:"center"
          }}
        >

          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>

          <button
            onClick={openCart}
            style={{
              border:"none",
              background:"none",
              cursor:"pointer",
              fontWeight:"500"
            }}
          >
            Cart ({cart.length})
          </button>

          <Link href="/login">Login</Link>

        </nav>

      </header>

      {/* ⭐ GLOBAL CART DRAWER */}
      <CartDrawer open={drawerOpen} setOpen={closeCart} />

    </>
  )
}
