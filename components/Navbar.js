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
  const { user, loading, authReady, logout } = useAuth();

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

  /* ===== WAIT FOR AUTH ===== */
  if (!authReady) return null;

  /* ===== PUBLIC MENU (ALWAYS SAME) ===== */
  const publicMenus = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Track", path: "/track" },
    { name: "Blog", path: "/blog" },
  ];

  /* ===== ROLE MENU ===== */
  const roleBasedMenus = user ? roleMenus[user.role] || [] : [];

  /* ===== LOGOUT ===== */
  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <>
      <header style={header}>
        {/* LOGO */}
        <Link href="/">
          <img src="/logo.png" style={logo} />
        </Link>

        {/* DESKTOP NAV */}
        <nav style={nav}>
          {/* PUBLIC MENU */}
          {publicMenus.map((m) => (
            <NavLink key={m.path} {...m} pathname={pathname} />
          ))}

          {/* ROLE MENU */}
          {user &&
            roleBasedMenus.map((m) => (
              <NavLink key={m.path} {...m} pathname={pathname} />
            ))}

          {/* CART */}
          <div style={cart} onClick={openCart}>
            <ShoppingCart size={18} />
            <span>{cartCount}</span>
          </div>

          {/* AUTH */}
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

          {/* MOBILE ICON */}
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
          {publicMenus.map((m) => (
            <Link key={m.path} href={m.path}>
              {m.name}
            </Link>
          ))}

          {user &&
            roleBasedMenus.map((m) => (
              <div key={m.path} onClick={() => router.push(m.path)}>
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

/* ===== LINK ===== */
function NavLink({ path, name, pathname }) {
  const active = pathname === path;

  return (
    <Link
      href={path}
      style={{
        color: active ? "#2563eb" : "#333",
        fontWeight: active ? "600" : "500",
        textDecoration: "none",
      }}
    >
      {name}
    </Link>
  );
}

/* ===== STYLES ===== */

const header = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 20px",
  borderBottom: "1px solid #eee",
  background: "#fff",
};

const nav = {
  display: "flex",
  gap: 15,
  alignItems: "center",
};

const logo = { height: 40 };

const cart = { cursor: "pointer", display: "flex", gap: 5 };

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
