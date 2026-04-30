"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ================= LOAD CART ================= */
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved) || []);
      } catch (e) {
        setCart([]);
      }
    }
  }, []);

  /* ================= SAVE CART ================= */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart || []));
  }, [cart]);

  /* ================= SAFE ADD ================= */
  const addToCart = (product) => {
    if (!product) return;

    setCart((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];

      const exists = safePrev.find(
        (p) =>
          (p._id && p._id === product._id) ||
          (p.id && p.id === product.id)
      );

      if (exists) {
        return safePrev.map((p) => {
          const match =
            (p._id && p._id === product._id) ||
            (p.id && p.id === product.id);

          return match
            ? { ...p, qty: (p.qty || 1) + 1 }
            : p;
        });
      }

      return [
        ...safePrev,
        {
          ...product,
          qty: 1,
        },
      ];
    });

    setDrawerOpen(true);
  };

  /* ================= SAFE REMOVE ================= */
  const removeFromCart = (id) => {
    if (!id) return;

    setCart((prev) =>
      (prev || []).filter(
        (p) =>
          p?._id !== id &&
          p?.id !== id &&
          p?.productId !== id
      )
    );
  };

  /* ================= SAFE QTY UPDATE ================= */
  const updateQty = (id, qty) => {
    if (!id) return;

    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prev) =>
      (prev || []).map((p) => {
        const match =
          p?._id === id ||
          p?.id === id ||
          p?.productId === id;

        if (!match) return p;

        return {
          ...p,
          qty,
        };
      })
    );
  };

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
