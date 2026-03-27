"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";
import useAuth from "@/hooks/useAuth";

export default function Navbar() {
  const { cart, drawerOpen, openCart, closeCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const { user, loading } = useAuth();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* ================= RESPONSIVE ================= */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= SEARCH ================= */
  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;

    router.push(`/products?search=${search}`);
    setSearch("");
    if (isMobile) setMenuOpen(false);
  }

  /* ================= LOGOUT ================= */
  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/login";
  }

  /* ================= ROUTE DETECTION ================= */
  const isAdminArea = pathname.startsWith("/admin");

  /* ================= LINKS ================= */
  const publicLinks = ["Home", "Products", "Track Order", "Blog"];

  if (loading) return null;

  return (
    <>
      <header style={header}>
        {/* LOGO */}
        <Link href="/">
          <img src="/logo.png" alt="Logo" style={logo} />
        </Link>

        {/* SEARCH (HIDE IN ADMIN) */}
        {!isAdminArea && (
          <form onSubmit={handleSearch} style={{ display: "flex" }}>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchInput}
            />
          </form>
        )}

        {/* MOBILE MENU BTN */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={hamburger(isMobile)}
        >
          <span />
          <span />
          <span />
        </button>

        {/* NAV */}
        <nav style={nav(isMobile, menuOpen)}>

          {/* ================= PUBLIC LINKS ================= */}
          {!isAdminArea &&
            publicLinks.map((link, i) => (
              <Link
                key={i}
                href={
                  link === "Home"
                    ? "/"
                    : link === "Track Order"
                    ? "/track"
                    : `/${link.toLowerCase().replace(" ", "-")}`
                }
                style={linkStyle}
              >
                {link}
              </Link>
            ))}

          {/* ================= CART ================= */}
          {!isAdminArea && (
            <div onClick={openCart} style={cartBox}>
              🛒
              {cart.length > 0 && (
                <span style={cartBadge}>{cart.length}</span>
              )}
            </div>
          )}

          {/* ================= AUTH ================= */}
          {!user ? (
            <Link href="/login" style={loginBtn}>
              Login
            </Link>
          ) : (
            <div style={userBox}>
              <span style={userName}>{user.name}</span>

              {/* ROLE LINKS */}
              {user.role === "admin" && (
                <Link href="/admin" style={roleLink}>
                  Admin Panel
                </Link>
              )}

              {user.role === "store" && (
                <Link href="/admin/store/dashboard" style={roleLink}>
                  Store Dashboard
                </Link>
              )}

              {user.role === "user" && (
                <Link href="/account" style={roleLink}>
                  My Orders
                </Link>
              )}

               {user.role === "branding" && (
                <Link href="/branding/dashboard" style={roleLink}>
                  Branding Dashboard
                </Link>
              )}

              <button onClick={handleLogout} style={logoutBtn}>
                Logout
              </button>
            </div>
          )}
        </nav>
      </header>

      <CartDrawer open={drawerOpen} setOpen={closeCart} />
    </>
  );
}

/* ================= STYLES ================= */

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px 30px",
  background: "#fff",
  borderBottom: "1px solid #eee",
  position: "sticky",
  top: 0,
  zIndex: 1000,
  flexWrap: "wrap",
};

const logo = {
  maxHeight: "55px",
  cursor: "pointer",
};

const searchInput = {
  padding: "8px 15px",
  borderRadius: "20px",
  border: "1px solid #ccc",
  width: 220,
};

const hamburger = (isMobile) => ({
  display: isMobile ? "flex" : "none",
  flexDirection: "column",
  gap: "4px",
  border: "none",
  background: "none",
  cursor: "pointer",
});

const nav = (isMobile, open) => ({
  display: isMobile ? (open ? "flex" : "none") : "flex",
  flexDirection: isMobile ? "column" : "row",
  gap: "20px",
  alignItems: "center",
});

/* LINKS */
const linkStyle = {
  textDecoration: "none",
  color: "#333",
  fontWeight: 500,
};

/* LOGIN */
const loginBtn = {
  padding: "6px 14px",
  borderRadius: 6,
  background: "#111",
  color: "#fff",
  textDecoration: "none",
};

/* USER BOX */
const userBox = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const userName = {
  fontSize: 14,
  fontWeight: 500,
};

/* ROLE LINK */
const roleLink = {
  textDecoration: "none",
  color: "#2563eb",
  fontSize: 14,
};

/* CART */
const cartBox = {
  position: "relative",
  cursor: "pointer",
  fontSize: 20,
};

const cartBadge = {
  position: "absolute",
  top: "-6px",
  right: "-10px",
  background: "#ef4444",
  color: "#fff",
  fontSize: 10,
  padding: "2px 6px",
  borderRadius: "50%",
};

/* LOGOUT */
const logoutBtn = {
  border: "none",
  background: "#111",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: 6,
  cursor: "pointer",
};
