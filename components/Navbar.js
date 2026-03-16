"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
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
    setMenuOpen(false) // close mobile menu on search
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
          className="hamburger-btn"
        >
          <span />
          <span />
          <span />
        </button>

        {/* MENU LINKS */}
        <nav className={`menu-links ${menuOpen ? "open" : ""}`}>
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
            >
              {link}
              <span style={{ display: "block", height: "2px", background: "#c28b45", width: "0%", transition: "0.3s" }} />
            </Link>
          ))}

          {/* CART BUTTON */}
          <button
            onClick={openCart}
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
      <style jsx>{`
        nav a:hover { color: #c28b45; }
        nav a:hover span { width: 100% !important; }

        .hamburger-btn {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 25px;
          height: 20px;
          border: none;
          background: none;
          cursor: pointer;
          z-index: 1100;
        }
        .hamburger-btn span {
          display: block;
          height: 3px;
          background: #3a2a1c;
          border-radius: 2px;
        }

        nav.menu-links {
          display: flex;
          gap: 25px;
          align-items: center;
          flex-wrap: wrap;
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 900px) {
          .hamburger-btn { display: flex; }

          nav.menu-links {
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: #fff;
            padding: 20px 0;
            display: none; /* hidden by default */
            gap: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          }

          nav.menu-links.open { display: flex; } /* shown when menuOpen=true */
        }
      `}</style>
    </>
  )
}
