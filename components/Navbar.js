"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";
import useAuth from "@/hooks/useAuth";
import { roleMenus } from "@/lib/roleMenus";

import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  LogOut,
} from "lucide-react";

export default function Navbar() {
  const { cartCount, drawerOpen, openCart, closeCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, refreshUser } = useAuth();

  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* ===== RESPONSIVE ===== */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ===== SCROLL SHADOW ===== */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ===== SEARCH ===== */
  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/products?search=${search}`);
    setSearch("");
  }

  /* ===== LOGOUT ===== */
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await refreshUser();
    router.push("/");
  }

  if (loading) return null;

  const menus = user ? roleMenus[user.role] || [] : [];

  return (
    <>
      <header style={{ ...header, boxShadow: scrolled ? shadow : "none" }}>
        {/* LEFT */}
        <div style={left}>
          <Link href="/" style={logoWrap}>
            <img src="/logo.png" style={logo} />
            <span style={brand}>ShopNative</span>
          </Link>
        </div>

        {/* CENTER SEARCH */}
        {!isMobile && (
          <form onSubmit={handleSearch} style={searchBox}>
            <Search size={16} />
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchInput}
            />
          </form>
        )}

        {/* RIGHT */}
        <div style={right}>
          {/* DESKTOP */}
          {!isMobile && (
            <>
              {/* PUBLIC */}
              <NavLink href="/" label="Home" pathname={pathname} />
              <NavLink href="/products" label="Products" pathname={pathname} />

              {/* ROLE MENUS */}
              {menus.map((m) => (
                <NavLink
                  key={m.name}
                  href={m.path}
                  label={m.name}
                  pathname={pathname}
                />
              ))}

              {/* CART */}
              <div style={cart} onClick={openCart}>
                <ShoppingCart size={18} />
                <span style={cartCountStyle}>{cartCount}</span>
              </div>

              {/* AUTH */}
              {!user ? (
                <Link href="/login" style={loginBtn}>
                  Login
                </Link>
              ) : (
                <div style={userWrapper}>
                  <div onClick={() => setUserMenu(!userMenu)} style={userBtn}>
                    <User size={18} />
                    <span>{user.name}</span>
                  </div>

                  {/* DROPDOWN */}
                  {userMenu && (
                    <div style={dropdown}>
                      <div style={dropdownItem}>
                        👤 {user.name}
                      </div>
                      <div style={dropdownItem}>
                        Role: {user.role}
                      </div>

                      <hr />

                      <div
                        style={{ ...dropdownItem, color: "red" }}
                        onClick={handleLogout}
                      >
                        <LogOut size={16} /> Logout
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* MOBILE */}
          {isMobile && (
            <div onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </div>
          )}
        </div>
      </header>

      {/* MOBILE MENU */}
      {menuOpen && isMobile && (
        <div style={mobileMenu}>
          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>

          {menus.map((m) => (
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
        color: active ? "#2563eb" : "#333",
        fontWeight: active ? "600" : "500",
        textDecoration: "none",
      }}
    >
      {label}
    </Link>
  );
}

/* ===== STYLES ===== */

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 24px",
  background: "#fff",
  position: "sticky",
  top: 0,
  zIndex: 100,
};

const shadow = "0 5px 20px rgba(0,0,0,0.08)";

const left = { display: "flex", alignItems: "center" };
const right = { display: "flex", alignItems: "center", gap: 20 };

const logoWrap = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  textDecoration: "none",
};

const logo = { height: 40 };
const brand = { fontWeight: 600, fontSize: 16, color: "#111" };

const searchBox = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  border: "1px solid #ddd",
  padding: "8px 12px",
  borderRadius: 8,
  width: "40%",
};

const searchInput = {
  border: "none",
  outline: "none",
  width: "100%",
};

const cart = {
  position: "relative",
  cursor: "pointer",
};

const cartCountStyle = {
  position: "absolute",
  top: -6,
  right: -10,
  background: "red",
  color: "#fff",
  borderRadius: "50%",
  fontSize: 10,
  padding: "2px 6px",
};

const loginBtn = {
  padding: "6px 14px",
  background: "#111",
  color: "#fff",
  borderRadius: 8,
};

const userWrapper = {
  position: "relative",
};

const userBtn = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  cursor: "pointer",
};

const dropdown = {
  position: "absolute",
  top: 35,
  right: 0,
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 10,
  padding: 10,
  minWidth: 180,
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
};

const dropdownItem = {
  padding: 8,
  cursor: "pointer",
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
