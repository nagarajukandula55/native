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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;

    router.push(`/products?search=${search}`);
    setSearch("");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.reload(); // 🔥 IMPORTANT
  }

  const isAdminArea = pathname.startsWith("/admin");
  const isBrandingArea = pathname.startsWith("/branding");

  if (loading) return null;

  return (
    <>
      <header style={header}>
        {/* LOGO */}
        <Link href="/">
          <img src="/logo.png" alt="Logo" style={logo} />
        </Link>

        {/* SEARCH */}
        {!isAdminArea && !isBrandingArea && (
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
          {!isAdminArea && !isBrandingArea && (
            <>
              <Link href="/">Home</Link>
              <Link href="/products">Products</Link>
              <Link href="/track">Track Order</Link>

              <div onClick={openCart} style={cartBox}>
                🛒 {cart.length}
              </div>
            </>
          )}

          {/* AUTH */}
          {!user ? (
            <Link href="/login" style={loginBtn}>
              Login
            </Link>
          ) : (
            <div style={userBox}>
              <span>{user.name}</span>

              {user.role === "admin" && <Link href="/admin">Admin</Link>}
              {user.role === "store" && <Link href="/admin/store">Store</Link>}
              {user.role === "user" && <Link href="/account">My Orders</Link>}

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

/* STYLES */
const header = {
  display: "flex",
  justifyContent: "space-between",
  padding: 15,
  borderBottom: "1px solid #eee",
};

const logo = { height: 50 };

const searchInput = {
  padding: 8,
  border: "1px solid #ccc",
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
};

const userBox = {
  display: "flex",
  gap: 10,
  alignItems: "center",
};

const logoutBtn = {
  padding: 6,
  background: "#111",
  color: "#fff",
};
