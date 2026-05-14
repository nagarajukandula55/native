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

  /* ================= SAVE (NON-BLOCKING) ================= */
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem("cart", JSON.stringify(cart || []));
    }, 0);

    return () => clearTimeout(t);
  }, [cart]);

  /* ================= ADD ================= */
  const addToCart = (product) => {
    if (!product) return;

    // ✅ FIXED: always prefer real Mongo _id
    const productId = product._id || product.productId || null;

    // keep productKey separately (DO NOT use as productId)
    const productKey = product.productKey || product._id;

    if (!productId) return;

    setCart((prev) => {
      const exists = prev.find(
        (p) =>
          p.productId === productId ||
          p.productKey === productKey
      );

      if (exists) {
        return prev.map((p) =>
          p.productId === productId ||
          p.productKey === productKey
            ? { ...p, qty: (p.qty || 1) + 1 }
            : p
        );
      }

      return [
        ...prev,
        {
          productId, // ✅ correct id stored
          productKey,
          name: product.name || "Product",
          price: Number(product.price || 0),
          image: product.image || "",
          qty: 1,

          // fallback GST (optional)
          hsn: product.hsn || "",
          gstPercent: product.gstPercent || 0,
        },
      ];
    });

    setDrawerOpen(true);
  };

  /* ================= REMOVE ================= */
  const removeFromCart = (id) => {
    setCart((prev) =>
      prev.filter(
        (p) =>
          p.productId !== id &&
          p.productKey !== id &&
          p._id !== id
      )
    );
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
        p.productId === id ||
        p.productKey === id ||
        p._id === id
          ? { ...p, qty }
          : p
      )
    );
  };

  /* ================= DRAWER ================= */
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
