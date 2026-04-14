"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";
import useAuth from "@/hooks/useAuth";
import { roleMenus } from "@/lib/roleMenus";

export default function Navbar() {
  const { cartCount, drawerOpen, openCart, closeCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const { user, loading, refreshUser } = useAuth();

  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
  }

  /* ================= LOGOUT ================= */
  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    await refreshUser();
    router.push("/");
  }

  const isAdminArea =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/finance") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/branding") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/super-admin");

  if (loading) return null;

  const menus = user ? roleMenus[user.role] || [] : [];

  return (
    <>
      <header style={header}>
        {/* LOGO */}
        <Link href="/">
          <img src="/logo.png" alt="Logo" style={logo} />
        </Link>

        {/* SEARCH */}
        {!isAdminArea && !isMobile && (
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchInput}
            />
          </form>
        )}

        {/* NAV */}
        <nav style={nav}>
          {/* PUBLIC MENU */}
          {!isAdminArea && !isMobile && (
            <>
              <Link href="/">Home</Link>
              <Link href="/products">Products</Link>
              <Link href="/track">Track</Link>

              <div onClick={openCart} style={cartBox}>
                🛒 {cartCount}
              </div>
            </>
          )}

          {/* AUTH */}
          {!user ? (
            <Link href="/login" style={loginBtn}>
              Login
            </Link>
          ) : (
            <>
              {/* DESKTOP ROLE MENU */}
              {!isMobile &&
                menus.map((m) => (
                  <Link key={m.name} href={m.path}>
                    {m.name}
                  </Link>
                ))}

              {!isMobile && <span>👤 {user.name}</span>}

              {!isMobile && (
                <button onClick={handleLogout} style={logoutBtn}>
                  Logout
                </button>
              )}

              {/* MOBILE MENU BUTTON */}
              {isMobile && (
                <div onClick={() => setMenuOpen(!menuOpen)}>☰</div>
              )}
            </>
          )}
        </nav>
      </header>

      {/* MOBILE MENU */}
      {menuOpen && isMobile && (
        <div style={mobileMenu}>
          {!user ? (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup">Signup</Link>
            </>
          ) : (
            <>
              {menus.map((m) => (
                <div key={m.name} onClick={() => router.push(m.path)}>
                  {m.name}
                </div>
              ))}
              <div>👤 {user.name}</div>
              <div onClick={handleLogout} style={{ color: "red" }}>
                Logout
              </div>
            </>
          )}
        </div>
      )}

      <CartDrawer open={drawerOpen} setOpen={closeCart} />
    </>
  );
}

/* ===== STYLES ===== */

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 15,
  borderBottom: "1px solid #eee",
  background: "#fff",
};

const logo = { height: 50 };

const searchInput = {
  padding: 8,
  border: "1px solid #ccc",
  borderRadius: 6,
};

const nav = {
  display: "flex",
  gap: 15,
  alignItems: "center",
};

const cartBox = { cursor: "pointer" };

const loginBtn = {
  padding: 6,
  background: "#111",
  color: "#fff",
  borderRadius: 6,
};

const logoutBtn = {
  padding: 6,
  background: "#111",
  color: "#fff",
  borderRadius: 6,
};

const mobileMenu = {
  position: "absolute",
  top: 70,
  right: 10,
  background: "#fff",
  padding: 15,
  borderRadius: 10,
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  zIndex: 999,
};
