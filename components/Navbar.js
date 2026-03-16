"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useCart } from "@/context/CartContext"
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { cart, drawerOpen, openCart, closeCart } = useCart()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    if (!search.trim()) return
    router.push(`/products?search=${search}`)
    setSearch("")
    setMenuOpen(false) // auto-hide mobile menu on search
  }

  const links = ["Home", "Products", "Track Order", "Blog"]

  // ✅ Auto-hide menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900 && menuOpen) {
        setMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [menuOpen])

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
        <Link href="/" onClick={() => setMenuOpen(false)}>
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
        <form
          onSubmit={handleSearch}
          style={{ display: "flex", gap: "10px" }}
        >
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
            display: "none",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "25px",
            height: "20px",
            border: "none",
            background: "none",
            cursor: "pointer",
            zIndex: 1100
          }}
          className="hamburger-btn"
        >
          <span style={{ display: "block", height: "3px", background: "#3a2a1c", borderRadius: "2px" }} />
          <span style={{ display: "block", height: "3px", background: "#3a2a1c", borderRadius: "2px" }} />
          <span style={{ display: "block", height: "3px", background: "#3a2a1c", borderRadius: "2px" }} />
        </button>

        {/* MENU LINKS */}
        <nav
          style={{
            display: "flex",
            gap: "25px",
            alignItems: "center",
            flexWrap: "wrap",
            position: "relative"
          }}
          className={menuOpen ? "mobile-menu-open" : ""}
        >
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
                fontSize: "16px",
                position: "relative",
                padding: "5px 0",
                transition: "all 0.2s ease-in-out"
              }}
              onClick={() => setMenuOpen(false)} // auto-hide on link click
            >
              {link}
              <span style={{ display: "block", height: "2px", background: "#c28b45", width: "0%", transition: "0.3s" }} />
            </Link>
          ))}

          {/* CART BUTTON */}
          <button
            onClick={() => { openCart(); setMenuOpen(false) }}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "16px",
              color: "#3a2a1c",
              position: "relative"
            }}
          >
            Cart ({cart.length})
          </button>

          {/* LOGIN */}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            style={{
              textDecoration: "none",
              color: "#3a2a1c",
              fontWeight: "500",
              fontSize: "16px"
            }}
          >
            Login
          </Link>
        </nav>
      </header>

      {/* ⭐ GLOBAL CART DRAWER */}
      <CartDrawer open={drawerOpen} setOpen={closeCart} />

      {/* STYLES */}
      <style>
        {`
          nav a:hover { color: #c28b45; }
          nav a:hover span { width: 100% !important; }

          /* MOBILE RESPONSIVE */
          @media (max-width: 900px) {
            .hamburger-btn { display: flex; }
            nav {
              flex-direction: column;
              position: absolute;
              top: 100%;
              left: 0;
              width: 100%;
              background: #fff;
              padding: 20px 0;
              display: ${menuOpen ? "flex" : "none"};
              gap: 15px;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
              z-index: 1050;
            }
          }
        `}
      </style>
    </>
  )
}
