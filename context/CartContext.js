"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved) || []);
      } catch {
        setCart([]);
      }
    }
  }, []);

  /* ================= SAVE ================= */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart || []));
  }, [cart]);

  /* ================= ADD ================= */
  const addToCart = (product) => {
    if (!product?._id) return;

    setCart((prev) => {
      const exists = prev.find((p) => p._id === product._id);

      if (exists) {
        return prev.map((p) =>
          p._id === product._id
            ? { ...p, qty: (p.qty || 1) + 1 }
            : p
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });

    setDrawerOpen(true);
  };

  /* ================= REMOVE ================= */
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p._id !== id));
  };

  /* ================= UPDATE QTY ================= */
  const updateQty = (id, qty) => {
    if (!id) return;

    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prev) =>
      prev.map((p) =>
        p._id === id ? { ...p, qty } : p
      )
    );
  };

  /* ================= CLOSE DRAWER SAFETY ================= */
  const closeCart = () => setDrawerOpen(false);
  const openCart = () => setDrawerOpen(true);

  /* ================= TOTAL ================= */
  const cartTotal = (cart || []).reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 0),
    0
  );

  const cartCount = (cart || []).reduce(
    (sum, item) => sum + (item.qty || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateQty,
        cartTotal,
        cartCount,
        drawerOpen,
        setDrawerOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
