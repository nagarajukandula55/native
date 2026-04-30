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
        setCart(JSON.parse(saved));
      } catch (e) {
        setCart([]);
      }
    }
  }, []);

  /* ================= SAVE CART ================= */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  /* ================= UNIQUE KEY ================= */
  const getKey = (item) =>
    `${item.productId || item._id}-${item.variant || "default"}`;

  /* ================= ADD TO CART ================= */
  const addToCart = (product) => {
    setCart((prev) => {
      const key = getKey(product);

      const exists = prev.find((p) => getKey(p) === key);

      if (exists) {
        return prev.map((p) =>
          getKey(p) === key
            ? { ...p, qty: (p.qty || 1) + 1 }
            : p
        );
      }

      return [
        ...prev,
        {
          ...product,
          qty: 1,
        },
      ];
    });

    setDrawerOpen(true);
  };

  /* ================= REMOVE ================= */
  const removeFromCart = (product) => {
    const key = getKey(product);

    setCart((prev) =>
      prev.filter((p) => getKey(p) !== key)
    );
  };

  /* ================= UPDATE QTY ================= */
  const updateQty = (product, qty) => {
    const key = getKey(product);

    if (qty <= 0) return removeFromCart(product);

    setCart((prev) =>
      prev.map((p) =>
        getKey(p) === key ? { ...p, qty } : p
      )
    );
  };

  /* ================= TOTALS ================= */
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const cartCount = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  /* ================= CONTROLS ================= */
  const openCart = () => setDrawerOpen(true);
  const closeCart = () => setDrawerOpen(false);

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
        openCart,
        closeCart,
        setDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
