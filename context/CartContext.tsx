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
     UI ACTIONS
  ========================================================= */

  const openCart = () => setDrawerOpen(true);

  const closeCart = () => setDrawerOpen(false);

  /* =========================================================
     LOAD CART
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
     SAVE CART
  ========================================================= */

  useEffect(() => {
    if (!hydrated.current) return;

    localStorage.setItem(
      "cart",
      JSON.stringify(cart || [])
    );
  }, [cart]);

  /* =========================================================
     ADD TO CART (FINAL FIXED)
  ========================================================= */

  const addToCart = (product: any) => {
    if (!product) return;

    /* =========================================================
       CRITICAL FIX
       PRIORITIZE REAL MONGO ID
    ========================================================= */

    const productId =
      product.productId || product._id;

    const productKey =
      product.productKey;

    if (!productId || !productKey) {
      console.error(
        "Invalid product payload:",
        product
      );
      return;
    }

    console.log("ADD TO CART SAFE:", {
      productId,
      productKey,
      name: product.name,
    });

    setCart((prev) => {
      const exists = prev.find(
        (p) => p.productId === productId
      );

      /* =========================================================
         ALREADY EXISTS
      ========================================================= */

      if (exists) {
        return prev.map((p) =>
          p.productId === productId
            ? {
                ...p,
                qty: (p.qty || 1) + 1,
              }
            : p
        );
      }

      /* =========================================================
         NEW ITEM
      ========================================================= */

      return [
        ...prev,
        {
          productId,
          productKey,

          name:
            product.name || "Product",

          price: Number(
            product.price ||
              product.primaryVariant?.price ||
              product.pricing?.sellingPrice ||
              0
          ),

          image:
            product.image ||
            product.primaryImage ||
            "/placeholder.png",

          qty: 1,

          hsn:
            product.hsn || "",

          gstPercent:
            product.tax ||
            product.gstPercent ||
            0,
        },
      ];
    });

    setDrawerOpen(true);
  };

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

  const removeFromCart = (id: string) => {
    setCart((prev) =>
      prev.filter(
        (p) => p.productId !== id
      )
    );
  };

  /* =========================================================
     UPDATE QUANTITY
  ========================================================= */

  const updateQty = (
    id: string,
    qty: number
  ) => {
    if (qty <= 0) {
      return removeFromCart(id);
    }

    setCart((prev) =>
      prev.map((p) =>
        p.productId === id
          ? { ...p, qty }
          : p
      )
    );
  };

  /* =========================================================
     TOTALS
  ========================================================= */

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum +
      (item.price || 0) *
        (item.qty || 0),
    0
  );

  const cartCount = cart.reduce(
    (sum, item) =>
      sum + (item.qty || 0),
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

export const useCart = () =>
  useContext(CartContext);
