"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useUser } from "@/context/UserContext";
import CartDrawer from "./CartDrawer";
import SearchBar from "./SearchBar";
import PincodeBar from "./PincodeBar";
import {
  ShoppingCart,
  Menu,
  X,
  Heart,
  User,
  LogOut,
  Home,
  Package,
  Carrot,
  Store,
  Fish,
  Truck,
  Handshake,
  MessageSquareQuote,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";

// "super_admin" (underscore) is the role string used elsewhere in this
// codebase (app/super-admin/users/page.js's role picker); kept alongside
// other separator variants defensively.
const ADMIN_ROLES = ["admin", "super_admin", "super-admin", "superadmin", "owner"];
const VENDOR_ROLES = ["vendor", ...ADMIN_ROLES];

// Auth/onboarding pages get a bare logo-only header -- the full nav
// (Products/Track/Sell, search, cart, wishlist, account menu) has nothing
// useful to do on a login/signup/reset-password screen and was cluttering
// it; every real ecommerce site strips chrome down on these pages.
const MINIMAL_HEADER_PREFIXES = ["/login", "/signup", "/reset-password", "/verify", "/checkout"];

export default function Navbar({ logoUrl } = {}) {
  const { cartCount, drawerOpen, openCart, closeCart } = useCart();
  const wishlistCtx = useWishlist();
  const wishlistCount = wishlistCtx?.wishlistCount || 0;

  const { user, loading: userLoading, logout } = useUser();
  const role = (user?.role || "").toLowerCase();
  const isVendor = VENDOR_ROLES.includes(role);

  const router = useRouter();
  const pathname = usePathname();
  const minimalHeader = MINIMAL_HEADER_PREFIXES.some((p) => pathname?.startsWith(p));

  const [mobile, setMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  /* ================= RESPONSIVE ================= */
  useEffect(() => {
    const resize = () => setMobile(window.innerWidth < 900);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ================= HANDLERS ================= */
  const handleCartClick = () => {
    openCart?.();
  };

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    setMenuOpen(false);
    router.push("/");
  };

  if (minimalHeader) {
    return (
      <header className="header minimalHeaderBar">
        <Link href="/" className="logoLink">
          <img
            src={logoUrl || "/brand/native_logo_circle.png"}
            className="logo"
            alt="Native"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/brand/native_logo_circle.png";
            }}
          />
        </Link>
        <style jsx>{`
          .minimalHeaderBar {
            justify-content: center;
            padding: 20px 24px;
          }
          .logo {
            height: 40px;
          }
        `}</style>
      </header>
    );
  }

  return (
    <>
      <header className="header">
        {/* LOGO */}
        <Link href="/" className="logoLink">
          {/* Dynamic business-uploaded logo (ANgroup Business.logo, via
              app/layout.tsx's getBusinessBranding()) with a graceful
              fallback to the static asset when none is configured. */}
          <img
            src={logoUrl || "/brand/native_logo_circle.png"}
            className="logo"
            alt="Native"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/brand/native_logo_circle.png";
            }}
          />
        </Link>

        {!mobile && (
          <div className="searchWrap">
            <SearchBar />
          </div>
        )}

        <nav className="nav">
          {!mobile && <PincodeBar />}
          {!mobile && (
            <>
              <NavLink href="/" label="Home" pathname={pathname} icon={Home} />
              <NavLink href="/products" label="Products" pathname={pathname} icon={Package} />
              {/* Monthly Groceries / Santha are distinct pincode-scoped
                  quote-request flows, not a normal product category, so
                  they get their own nav entries (not a home category tile).
                  Always clickable -- if the customer's pincode isn't
                  covered yet, the page itself explains the service and
                  says we'll be in their city soon, rather than the nav
                  greying the link out. */}
              <NavLink href="/groceries" label="Groceries" pathname={pathname} icon={Carrot} />
              <NavLink href="/santha" label="Santha" pathname={pathname} icon={Store} />
              <NavLink href="/live-market" label="Live Market" pathname={pathname} icon={Fish} />
              <NavLink href="/track" label="Track" pathname={pathname} icon={Truck} />
              {/* Blog nav hidden per explicit direction -- to be
                  implemented/re-enabled later. Page itself (app/blog)
                  intentionally left in place, just not linked. */}
              <NavLink href="/sell" label="Sell on Native" pathname={pathname} icon={Handshake} />
              <NavLink href="/quote" label="Get a Quote" pathname={pathname} icon={MessageSquareQuote} />
            </>
          )}

          {/* WISHLIST */}
          <Link href="/wishlist" className="iconBtn" title="Wishlist">
            <Heart size={18} />
            <span>{wishlistCount}</span>
          </Link>

          {/* CART */}
          <div onClick={handleCartClick} className="iconBtn" role="button" tabIndex={0} title="Cart">
            <ShoppingCart size={18} />
            <span>{cartCount}</span>
          </div>

          {/* ACCOUNT */}
          {!mobile && !userLoading && (
            <div className="account">
              {user ? (
                <>
                  <button className="accountBtn" onClick={() => setAccountOpen((o) => !o)}>
                    <User size={18} />
                    <span>{user.name?.split(" ")[0] || "Account"}</span>
                  </button>

                  {accountOpen && (
                    <div className="dropdown" onMouseLeave={() => setAccountOpen(false)}>
                      <Link href="/profile" onClick={() => setAccountOpen(false)}>
                        <User size={14} /> Profile
                      </Link>
                      <Link href="/orders" onClick={() => setAccountOpen(false)}>
                        <ClipboardList size={14} /> My Orders
                      </Link>
                      <Link href="/groceries/orders" onClick={() => setAccountOpen(false)}>
                        <Carrot size={14} /> My Grocery Orders
                      </Link>
                      <Link href="/santha/orders" onClick={() => setAccountOpen(false)}>
                        <Store size={14} /> My Santha Orders
                      </Link>
                      <Link href="/live-market/orders" onClick={() => setAccountOpen(false)}>
                        <Fish size={14} /> My Live Market Orders
                      </Link>
                      {isVendor && (
                        <Link href="/vendor/dashboard" onClick={() => setAccountOpen(false)}>
                          <LayoutDashboard size={14} /> Vendor Dashboard
                        </Link>
                      )}
                      <button onClick={handleLogout} className="logoutRow">
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Link href="/login" className="loginLink">
                    Login
                  </Link>
                  <Link href="/signup" className="signupBtn">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}

          {/* MOBILE MENU TOGGLE */}
          {mobile && (
            <div onClick={() => setMenuOpen(!menuOpen)} className="menuToggle">
              {menuOpen ? <X /> : <Menu />}
            </div>
          )}
        </nav>
      </header>

      {/* MOBILE MENU */}
      {mobile && menuOpen && (
        <div className="mobileMenu">
          <PincodeBar />
          <SearchBar />
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Home size={16} /> Home
          </Link>
          <Link href="/products" onClick={() => setMenuOpen(false)}>
            <Package size={16} /> Products
          </Link>
          {/* groceriesDisabled/santhaDisabled/NOT_AVAILABLE_NOTE were
              referenced here but never declared anywhere in this file --
              a ReferenceError the instant a user opened the mobile menu.
              Matches the desktop nav's own comment/choice just above: link
              is always shown, the destination page itself explains
              unavailability for a given pincode rather than the nav
              greying it out. */}
          <Link href="/groceries" onClick={() => setMenuOpen(false)}>
            <Carrot size={16} /> Groceries
          </Link>
          <Link href="/santha" onClick={() => setMenuOpen(false)}>
            <Store size={16} /> Santha
          </Link>
          <Link href="/live-market" onClick={() => setMenuOpen(false)}>
            <Fish size={16} /> Live Market
          </Link>
          <Link href="/wishlist" onClick={() => setMenuOpen(false)}>
            <Heart size={16} /> Wishlist ({wishlistCount})
          </Link>
          <Link href="/track" onClick={() => setMenuOpen(false)}>
            <Truck size={16} /> Track
          </Link>
          <Link href="/sell" onClick={() => setMenuOpen(false)}>
            <Handshake size={16} /> Sell on Native
          </Link>
          <Link href="/quote" onClick={() => setMenuOpen(false)}>
            <MessageSquareQuote size={16} /> Get a Quote
          </Link>

          <hr />

          {user ? (
            <>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                <User size={16} /> Profile
              </Link>
              <Link href="/orders" onClick={() => setMenuOpen(false)}>
                <ClipboardList size={16} /> My Orders
              </Link>
              <Link href="/groceries/orders" onClick={() => setMenuOpen(false)}>
                <Carrot size={16} /> My Grocery Orders
              </Link>
              <Link href="/santha/orders" onClick={() => setMenuOpen(false)}>
                <Store size={16} /> My Santha Orders
              </Link>
              <Link href="/live-market/orders" onClick={() => setMenuOpen(false)}>
                <Fish size={16} /> My Live Market Orders
              </Link>
              {isVendor && (
                <Link href="/vendor/dashboard" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={16} /> Vendor Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="mobileLogout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link href="/signup" className="mobileSignup" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}

      {/* CART DRAWER */}
      <CartDrawer open={drawerOpen} setOpen={closeCart} />

      <style jsx>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          border-bottom: 1px solid #eee;
          background: #fff;
          position: sticky;
          top: 0;
          z-index: 50;
          gap: 16px;
        }
        .logoLink {
          flex-shrink: 0;
        }
        .logo {
          height: 40px;
        }
        .searchWrap {
          flex: 1;
          max-width: 360px;
        }
        .nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .iconBtn {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          border-radius: 8px;
          color: #333;
          text-decoration: none;
        }
        .iconBtn:hover {
          background: #faf5ec;
        }
        .iconBtn :global(span) {
          background: #1f3d2b;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
        }
        .account {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: 4px;
        }
        .accountBtn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: 1px solid #eee;
          padding: 8px 12px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
        }
        .dropdown {
          position: absolute;
          top: 44px;
          right: 0;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          padding: 8px;
          display: flex;
          flex-direction: column;
          min-width: 180px;
          z-index: 60;
        }
        .dropdown :global(a),
        .dropdown .logoutRow {
          padding: 10px 12px;
          border-radius: 6px;
          text-decoration: none;
          color: #333;
          font-size: 14px;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dropdown :global(a:hover),
        .dropdown .logoutRow:hover {
          background: #faf5ec;
        }
        .logoutRow {
          color: #e11d48;
        }
        .loginLink {
          color: #333;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
        }
        .signupBtn {
          background: #c28b45;
          color: #fff;
          padding: 9px 20px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
        }
        .signupBtn:hover {
          background: #a36d32;
        }
        .menuToggle {
          cursor: pointer;
        }
        .mobileMenu {
          position: absolute;
          top: 64px;
          right: 10px;
          left: 10px;
          background: #fff;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 999;
        }
        .mobileMenu :global(a) {
          color: #333;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mobileNavDisabled {
          color: #bbb;
          cursor: not-allowed;
        }
        .mobileNavDisabled em {
          font-style: normal;
          font-size: 11px;
        }
        .mobileSignup {
          background: #c28b45;
          color: #fff !important;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
        }
        .mobileLogout {
          background: none;
          border: none;
          color: #e11d48;
          text-align: left;
          padding: 0;
          font-size: 14px;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}

/* ================= NAV LINK ================= */
function NavLink({ href, label, pathname, disabled, disabledTitle, icon: Icon }) {
  const active = pathname === href;

  if (disabled) {
    return (
      <span
        title={disabledTitle}
        style={{
          marginRight: 4,
          padding: "8px 10px",
          borderRadius: 8,
          color: "#bbb",
          fontWeight: 600,
          fontSize: 13,
          textTransform: "uppercase",
          letterSpacing: "0.4px",
          cursor: "not-allowed",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {Icon && <Icon size={14} />}
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      style={{
        marginRight: 4,
        padding: "8px 10px",
        borderRadius: 8,
        color: active ? "#1f3d2b" : "#333",
        fontWeight: active ? "700" : "600",
        textDecoration: "none",
        fontSize: 13,
        textTransform: "uppercase",
        letterSpacing: "0.4px",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {Icon && <Icon size={14} />}
      {label}
    </Link>
  );
}
