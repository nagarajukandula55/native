"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";
import { useAuth } from "@/context/AuthContext";
import { roleMenus } from "@/lib/roleMenus";
import { ShoppingCart, Menu, X } from "lucide-react";

export default function Navbar() {
  const { cartCount, drawerOpen, openCart, closeCart } = useCart();
  const { user, loading, logout } = useAuth();

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

  const showPublic = !user;

  const roleBasedMenus = user ? roleMenus[user.role] || [] : [];

  return (
    <>
      <header style={header}>

        {/* LOGO */}
        <Link href="/">
          <img src="/logo.png" style={logo} />
        </Link>

        <nav style={nav}>

          {/* ================= PUBLIC MENU ================= */}
          {showPublic && (
            <>
              <NavLink href="/" label="Home" pathname={pathname} />
              <NavLink href="/products" label="Products" pathname={pathname} />
              <NavLink href="/track" label="Track" pathname={pathname} />
              <NavLink href="/blog" label="Blog" pathname={pathname} />
              <NavLink href="/login" label="Login" pathname={pathname} />
            </>
          )}

          {/* ================= ROLE MENU ================= */}
          {user &&
            roleBasedMenus.map((m) => (
              <NavLink
                key={m.name}
                href={m.path}
                label={m.name}
                pathname={pathname}
              />
            ))}

          {/* ================= USER INFO ================= */}
          {user && (
            <>
              <span style={{ marginLeft: 10 }}>Hi, {user.name}</span>

              <button onClick={logout} style={logoutBtn}>
                Logout
              </button>
            </>
          )}

          {/* CART ONLY FOR PUBLIC */}
          {showPublic && (
            <div onClick={openCart} style={cart}>
              <ShoppingCart size={18} />
              <span>{cartCount}</span>
            </div>
          )}

          {/* MOBILE MENU ICON ALWAYS VISIBLE */}
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
          {showPublic && (
            <>
              <Link href="/">Home</Link>
              <Link href="/products">Products</Link>
              <Link href="/track">Track</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/login">Login</Link>
            </>
          )}

          {user &&
            roleBasedMenus.map((m) => (
              <div key={m.name} onClick={() => router.push(m.path)}>
                {m.name}
              </div>
            ))}

          {user && <div onClick={logout}>Logout</div>}
        </div>
      )}

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
  alignItems: "center",
};

const nav = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const logo = { height: 40 };

const cart = { cursor: "pointer", display: "flex", gap: 5 };

const logoutBtn = {
  marginLeft: 10,
  padding: "6px 10px",
  background: "#ef4444",
  color: "#fff",
  borderRadius: 6,
  border: "none",
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
