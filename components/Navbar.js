"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";
import useAuth from "@/hooks/useAuth";
import { roleMenus } from "@/lib/roleMenus";

import { ShoppingCart, User, Menu, X, Search } from "lucide-react";

export default function Navbar() {
  const { cartCount, drawerOpen, openCart, closeCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, refreshUser } = useAuth();

  const [search, setSearch] = useState("");
  const [mobile, setMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* ===== RESPONSIVE ===== */
  useEffect(() => {
    const resize = () => setMobile(window.innerWidth < 900);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ===== SCROLL EFFECT ===== */
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/products?search=${search}`);
    setSearch("");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await refreshUser();
    router.push("/");
  }

  if (loading) return null;

  const menus = user ? roleMenus[user.role] || [] : [];

  return (
    <>
      <header style={{
        ...header,
        background: scrolled
          ? "rgba(255,255,255,0.9)"
          : "linear-gradient(to right, #ffffff, #f9fafb)",
        backdropFilter: "blur(10px)",
        boxShadow: scrolled ? "0 8px 25px rgba(0,0,0,0.08)" : "none"
      }}>
        
        {/* LOGO */}
        <Link href="/">
          <img src="/logo.png" style={logo} />
        </Link>

        {/* SEARCH */}
        {!mobile && (
          <form onSubmit={handleSearch} style={searchBox}>
            <Search size={16} />
            <input
              placeholder="Search for products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchInput}
            />
          </form>
        )}

        {/* NAV */}
        <nav style={nav}>
          {!mobile && (
            <>
              <NavLink href="/" label="Home" pathname={pathname} />
              <NavLink href="/products" label="Products" pathname={pathname} />
              <NavLink href="/track" label="Track" pathname={pathname} />
              <NavLink href="/blog" label="Blog" pathname={pathname} />

              {menus.map(m => (
                <NavLink key={m.name} href={m.path} label={m.name} pathname={pathname} />
              ))}

              {/* CART */}
              <div style={cart} onClick={openCart}>
                <ShoppingCart size={18} />
                <span style={cartCountStyle}>{cartCount}</span>
              </div>

              {/* AUTH */}
              {!user ? (
                <Link href="/login" style={loginBtn}>Login</Link>
              ) : (
                <div style={userWrap}>
                  <div onClick={() => setUserMenu(!userMenu)} style={userBtn}>
                    <User size={18} />
                    <span>{user.name}</span>
                  </div>

                  {userMenu && (
                    <div style={dropdown}>
                      <div style={dropdownItem}>{user.name}</div>
                      <div style={dropdownItem}>{user.role}</div>
                      <hr />
                      <div onClick={handleLogout} style={{...dropdownItem, color: "red"}}>
                        Logout
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* MOBILE */}
          {mobile && (
            <div onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </div>
          )}
        </nav>
      </header>

      {/* MOBILE MENU */}
      {menuOpen && mobile && (
        <div style={mobileMenu}>
          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>
          <Link href="/track">Track</Link>
          <Link href="/blog">Blog</Link>

          {menus.map(m => (
            <div key={m.name} onClick={() => router.push(m.path)}>
              {m.name}
            </div>
          ))}

          {!user ? (
            <Link href="/login">Login</Link>
          ) : (
            <div onClick={handleLogout} style={{ color: "red" }}>
              Logout
            </div>
          )}
        </div>
      )}

      <CartDrawer open={drawerOpen} setOpen={closeCart} />
    </>
  );
}

/* ===== NAV LINK ===== */
function NavLink({ href, label, pathname }) {
  const active = pathname === href;

  return (
    <Link
      href={href}
      style={{
        position: "relative",
        textDecoration: "none",
        color: active ? "#2563eb" : "#333",
        fontWeight: 500,
      }}
    >
      {label}
      {active && <span style={underline}></span>}
    </Link>
  );
}

/* ===== STYLES ===== */

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 24px",
  position: "sticky",
  top: 0,
  zIndex: 100,
};

const logo = { height: 42 };

const nav = {
  display: "flex",
  alignItems: "center",
  gap: 20,
};

const searchBox = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "#f1f5f9",
  padding: "8px 12px",
  borderRadius: 999,
  width: "40%",
};

const searchInput = {
  border: "none",
  background: "transparent",
  outline: "none",
  width: "100%",
};

const cart = { position: "relative", cursor: "pointer" };

const cartCountStyle = {
  position: "absolute",
  top: -6,
  right: -10,
  background: "#ef4444",
  color: "#fff",
  borderRadius: "50%",
  fontSize: 10,
  padding: "2px 6px",
};

const loginBtn = {
  background: "#111",
  color: "#fff",
  padding: "6px 14px",
  borderRadius: 20,
};

const userWrap = { position: "relative" };

const userBtn = {
  display: "flex",
  gap: 6,
  alignItems: "center",
  cursor: "pointer",
};

const dropdown = {
  position: "absolute",
  top: 35,
  right: 0,
  background: "#fff",
  borderRadius: 10,
  padding: 10,
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
};

const dropdownItem = {
  padding: 6,
  cursor: "pointer",
};

const underline = {
  position: "absolute",
  bottom: -4,
  left: 0,
  height: 2,
  width: "100%",
  background: "#2563eb",
};

const mobileMenu = {
  position: "absolute",
  top: 70,
  right: 10,
  background: "#fff",
  padding: 15,
  borderRadius: 10,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};
