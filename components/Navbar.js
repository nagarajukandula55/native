"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";
import { useAuth } from "@/context/AuthContext";
import { roleMenus } from "@/lib/roleMenus";
import { ShoppingCart, User, Menu, X } from "lucide-react";

export default function Navbar() {
  const { cartCount, drawerOpen, openCart, closeCart } = useCart();
  const { user, loading, refreshUser } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  const [mobile, setMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ===== RESPONSIVE ===== */
  useEffect(() => {
    const resize = () => setMobile(window.innerWidth < 900);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ===== LOGOUT ===== */
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await refreshUser();
    router.push("/");
  }

  if (loading) return null;

  /* ===== ROLE MENUS ===== */
  const roleBasedMenus = user ? roleMenus[user.role] || [] : [];

  /* ===== DASHBOARD CHECK ===== */
  const isDashboard =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/finance") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/branding") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/super-admin");

  return (
    <>
      <header style={header}>
        {/* LOGO */}
        <Link href="/">
          <img src="/logo.png" style={logo} />
        </Link>

        {/* NAV */}
        <nav style={nav}>
          {/* ===== PUBLIC MENU (ALWAYS FOR NON-DASHBOARD) ===== */}
          {!isDashboard && (
            <>
              <NavLink href="/" label="Home" pathname={pathname} />
              <NavLink href="/products" label="Products" pathname={pathname} />
              <NavLink href="/track" label="Track" pathname={pathname} />
              <NavLink href="/blog" label="Blog" pathname={pathname} />
            </>
          )}

          {/* ===== ROLE MENU ===== */}
          {user &&
            roleBasedMenus.map((m) => (
              <NavLink
                key={m.name}
                href={m.path}
                label={m.name}
                pathname={pathname}
              />
            ))}

          {/* ===== CART ONLY FOR PUBLIC / CUSTOMER ===== */}
          {!isDashboard && (
            <div style={cart} onClick={openCart}>
              <ShoppingCart size={18} />
              <span>{cartCount}</span>
            </div>
          )}

          {/* ===== AUTH ===== */}
          {!user ? (
            <Link href="/login" style={loginBtn}>
              Login
            </Link>
          ) : (
            <div style={userBox}>
              <span>Hi, {user.name}</span>
              <button onClick={handleLogout} style={logoutBtn}>
                Logout
              </button>
            </div>
          )}

          {/* MOBILE MENU ICON */}
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
          {!isDashboard && (
            <>
              <Link href="/">Home</Link>
              <Link href="/products">Products</Link>
              <Link href="/track">Track</Link>
              <Link href="/blog">Blog</Link>
            </>
          )}

          {roleBasedMenus.map((m) => (
            <div key={m.name} onClick={() => router.push(m.path)}>
              {m.name}
            </div>
          ))}

          {!user ? (
            <Link href="/login">Login</Link>
          ) : (
            <div onClick={handleLogout}>Logout</div>
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
  padding: "12px 20px",
  borderBottom: "1px solid #eee",
};

const nav = {
  display: "flex",
  gap: 15,
  alignItems: "center",
};

const logo = { height: 40 };

const cart = { cursor: "pointer" };

const loginBtn = {
  padding: "6px 12px",
  background: "#111",
  color: "#fff",
  borderRadius: 6,
};

const userBox = {
  display: "flex",
  gap: 10,
  alignItems: "center",
};

const logoutBtn = {
  padding: "6px 10px",
  background: "red",
  color: "#fff",
  borderRadius: 6,
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
};
