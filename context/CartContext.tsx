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
  // Lazy initializer reads localStorage synchronously on first render,
  // instead of loading it in a separate effect -- that two-step (empty
  // initial state, then a LOAD effect setting the real value a tick later)
  // raced against the SAVE effect below under React 18 Strict Mode's
  // double-invoke-on-mount behavior (next.config's reactStrictMode: true):
  // the SAVE effect could fire with the still-empty initial `cart` and
  // overwrite a real, already-persisted cart with `[]` before the LOAD
  // effect's setCart landed. Reproduced consistently: add to cart, then
  // navigate (full page load) to /checkout -- the cart was gone. With the
  // initial state already correct, there's no empty-array window to leak
  // into a write.
  const [cart, setCart] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) || [] : [];
    } catch (err) {
      console.error("Cart load failed:", err);
      return [];
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hydrated = useRef(true);

  /* =========================================================
     UI ACTIONS
  ========================================================= */

  const openCart = () => setDrawerOpen(true);

  const closeCart = () => setDrawerOpen(false);

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

          // Which pack-size/variant this line is -- was computed by
          // ProductView's handleAddToCart but silently dropped here, so
          // the cart/checkout could never show which size was picked.
          variant:
            product.variant || "",
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
