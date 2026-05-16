"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/* =========================================================
   CONTEXT
========================================================= */

const CartContext = createContext<any>(null);

/* =========================================================
   PROVIDER
========================================================= */

export function CartProvider({ children }: any) {
  const [cart, setCart] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hydrated = useRef(false);

  /* =========================================================
     ACTIONS (MUST BE INSIDE COMPONENT)
  ========================================================= */

  const openCart = () => setDrawerOpen(true);
  const closeCart = () => setDrawerOpen(false);

  /* =========================================================
     LOAD CART (HYDRATION SAFE)
  ========================================================= */

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) {
        setCart(JSON.parse(saved) || []);
      }
    } catch (err) {
      console.error("Cart load failed:", err);
      setCart([]);
    }

    hydrated.current = true;
  }, []);

  /* =========================================================
     SAVE CART (AFTER HYDRATION ONLY)
  ========================================================= */

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem("cart", JSON.stringify(cart || []));
  }, [cart]);

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const addToCart = (product: any) => {
    if (!product) return;

    const productId = product.productId || product._id;
    const productKey = product.productKey || product._id;

    if (!productId || !productKey) {
      console.error("Invalid product payload:", product);
      return;
    }

    setCart((prev) => {
      const exists = prev.find((p) => p.productId === productId);

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
          productId,
          productKey,
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

  /* =========================================================
     REMOVE FROM CART
  ========================================================= */

  const removeFromCart = (id: string) => {
    if (!id) return;

    setCart((prev) => prev.filter((p) => p.productId !== id));
  };

  /* =========================================================
     UPDATE QUANTITY
  ========================================================= */

  const updateQty = (id: string, qty: number) => {
    if (!id) return;

    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prev) =>
      prev.map((p) =>
        p.productId === id ? { ...p, qty } : p
      )
    );
  };

  /* =========================================================
     TOTALS
  ========================================================= */

  const cartTotal = (cart || []).reduce(
    (sum, item) =>
      sum + (item.price || 0) * (item.qty || 0),
    0
  );

  const cartCount = (cart || []).reduce(
    (sum, item) => sum + (item.qty || 0),
    0
  );

  /* =========================================================
     PROVIDER
  ========================================================= */

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

/* =========================================================
   HOOK
========================================================= */

export const useCart = () => useContext(CartContext);
