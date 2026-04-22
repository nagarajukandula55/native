"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";
import { ShoppingCart, Menu, X } from "lucide-react";

export default function Navbar() {
  const { cartCount, drawerOpen, openCart, closeCart } = useCart();

  const user = null; // auth disabled for now

  const router = useRouter();
  const pathname = usePathname();

  const [mobile, setMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ================= RESPONSIVE ================= */
  useEffect(() => {
    const resize = () => setMobile(window.innerWidth < 900);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const showPublic = !user;

  /* ================= HANDLERS ================= */
  const handleCartClick = () => {
    openCart?.(); // 🔥 safe call
  };

  return (
    <>
      <header style={header}>
        {/* LOGO */}
        <Link href="/">
          <img src="/logo.png" style={logo} alt="logo" />
        </Link>

        <nav style={nav}>
          {/* PUBLIC MENU */}
          {showPublic && (
            <>
              <NavLink href="/" label="Home" pathname={pathname} />
              <NavLink href="/products" label="Products" pathname={pathname} />
              <NavLink href="/track" label="Track" pathname={pathname} />
              <NavLink href="/blog" label="Blog" pathname={pathname} />
              <NavLink href="/login" label="Login" pathname={pathname} />
            </>
          )}

          {/* CART */}
          <div
            onClick={handleCartClick}
            style={cart}
            role="button"
            tabIndex={0}
          >
            <ShoppingCart size={18} />
            <span>{cartCount}</span>
          </div>

          {/* MOBILE MENU */}
          {mobile && (
            <div
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ cursor: "pointer" }}
            >
              {menuOpen ? <X /> : <Menu />}
            </div>
          )}
        </nav>
      </header>

      {/* MOBILE MENU */}
      {mobile && menuOpen && (
        <div style={mobileMenu}>
          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>
          <Link href="/track">Track</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/login">Login</Link>
        </div>
      )}

      {/* CART DRAWER */}
      <CartDrawer open={drawerOpen} setOpen={closeCart} />
    </>
  );
}

/* ================= NAV LINK ================= */
function NavLink({ href, label, pathname }) {
  const active = pathname === href;

  return (
    <Link
      href={href}
      style={{
        marginRight: 12,
        color: active ? "#2563eb" : "#333",
        fontWeight: active ? "600" : "500",
        textDecoration: "none",
      }}
    >
      {label}
    </Link>
  );
}

/* ================= STYLES ================= */

const header = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 20px",
  borderBottom: "1px solid #eee",
  background: "#fff",
  position: "sticky",
  top: 0,
  zIndex: 50,
};

const nav = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const logo = { height: 40 };

const cart = {
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 8,
};

const mobileMenu = {
  position: "absolute",
  top: 60,
  right: 10,
  background: "#fff",
  padding: 15,
  borderRadius: 10,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  zIndex: 999,
};
