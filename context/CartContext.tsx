"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

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
    if (!product) return;

    // 🔴 STRICT CONTRACT ENFORCEMENT
    const productId = product._id;
    const productKey = product.productKey;

    if (!productId || !productKey) {
      console.error("Invalid product payload", product);
      return;
    }

    setCart((prev) => {
      const exists = prev.find(
        (p) => p.productId === productId
      );

      if (exists) {
        return prev.map((p) =>
          p.productId === productId
            ? { ...p, qty: (p.qty || 1) + 1 }
            : p
        );
      }

      return [
        ...prev,
        {
          productId,     // Mongo ID ONLY
          productKey,    // SKU ONLY
          name: product.name || "Product",
          price: Number(product.price || 0),
          image: product.image || "",
          qty: 1,

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
      prev.filter((p) => p.productId !== id)
    );
  };

  /* ================= UPDATE QTY ================= */
  const updateQty = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prev) =>
      prev.map((p) =>
        p.productId === id
          ? { ...p, qty }
          : p
      )
    );
  };

  /* ================= TOTALS ================= */
  const cartTotal = (cart || []).reduce(
    (sum, item) =>
      sum + (item.price || 0) * (item.qty || 0),
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
