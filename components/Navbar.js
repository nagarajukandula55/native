"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useCart } from "@/context/CartContext"
import CartDrawer from "./CartDrawer"
import useAuth from "@/lib/useAuth"

export default function Navbar() {
  const { cart, drawerOpen, openCart, closeCart } = useCart()
  const router = useRouter()
  const user = useAuth() // 🔥 AUTH HOOK

  const [search, setSearch] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (!search.trim()) return
    router.push(`/products?search=${search}`)
    setSearch("")
    if (isMobile) setMenuOpen(false)
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  const links = ["Home", "Products", "Track Order", "Blog"]

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
          flexWrap: "wrap",
          gap: "15px"
        }}
      >
        {/* LOGO */}
        <Link href="/">
          <img
            src="/logo.png"
            alt="Native"
            style={{
              height: "auto",
              maxHeight: "70px",
              width: "auto",
              cursor: "pointer",
              display: "block"
            }}
          />
        </Link>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 15px",
              borderRadius: "20px",
              border: "1px solid #ccc",
              width: "200px"
            }}
          />
        </form>

        {/* MOBILE HAMBURGER */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            flexDirection: "column",
            justifyContent: "space-between",
            width: "25px",
            height: "20px",
            border: "none",
            background: "none",
            cursor: "pointer",
            zIndex: 1100,
            display: isMobile ? "flex" : "none"
          }}
        >
          <span style={{ height: "3px", background: "#3a2a1c" }} />
          <span style={{ height: "3px", background: "#3a2a1c" }} />
          <span style={{ height: "3px", background: "#3a2a1c" }} />
        </button>

        {/* MENU */}
        <nav
          style={{
            display: isMobile ? (menuOpen ? "flex" : "none") : "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "15px" : "25px",
            alignItems: "center",
            position: isMobile ? "absolute" : "relative",
            top: isMobile ? "100%" : "auto",
            left: 0,
            width: isMobile ? "100%" : "auto",
            background: isMobile ? "#fff" : "transparent",
            padding: isMobile ? "20px 0" : 0,
            boxShadow: isMobile ? "0 5px 15px rgba(0,0,0,0.1)" : "none",
            zIndex: 1050
          }}
        >
          {/* LINKS */}
          {links.map((link, i) => (
            <Link
              key={i}
              href={
                link === "Home"
                  ? "/"
                  : link === "Track Order"
                  ? "/track"
                  : `/${link.toLowerCase().replace(" ", "-")}`
              }
              style={{
                textDecoration: "none",
                color: "#3a2a1c",
                fontWeight: "500",
                fontSize: "16px"
              }}
            >
              {link}
            </Link>
          ))}

          {/* CART */}
          <button
            onClick={openCart}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "16px",
              color: "#3a2a1c"
            }}
          >
            Cart ({cart.length})
          </button>

          {/* 🔥 AUTH SECTION */}
          {!user ? (
            <Link
              href="/login"
              style={{
                textDecoration: "none",
                color: "#3a2a1c",
                fontWeight: "500",
                fontSize: "16px"
              }}
            >
              Login
            </Link>
          ) : (
            <>
              <span style={{ fontSize: 14 }}>
                {user.name}
              </span>

              <button
                onClick={handleLogout}
                style={{
                  border: "none",
                  background: "#111",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </header>

      <CartDrawer open={drawerOpen} setOpen={closeCart} />

      <style>
        {`
          nav a:hover { color: #c28b45; }
        `}
      </style>
    </>
  )
}
