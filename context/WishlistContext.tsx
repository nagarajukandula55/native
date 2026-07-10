"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { isLoggedIn } from "@/lib/an-sdk/auth";
import {
  getServerWishlist,
  addServerWishlistItem,
  removeServerWishlistItem,
} from "@/lib/an-sdk/wishlist";

/* =========================================================
   WISHLIST CONTEXT
   Mirrors CartContext's localStorage pattern so it works
   instantly for guests with zero backend dependency (no login
   required to wishlist — public browsing must never be
   blocked). Each entry keeps just enough product info to
   render a card without an extra fetch (id, slug, name, price,
   image).

   When a user IS logged in, this also syncs with ANgroup's real
   per-user wishlist (GET/POST/DELETE /api/wishlist): on login it
   pushes any local (guest) items up to the server once, then
   treats the server list as the source of truth for add/remove
   going forward. Guests never touch the network — everything
   stays localStorage-only for them, so browsing/wishlisting
   without an account keeps working exactly as before.
========================================================= */

const WishlistContext = createContext<any>(null);

export function WishlistProvider({ children }: any) {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const hydrated = useRef(false);
  const serverSynced = useRef(false);

  /* LOAD (guest/local baseline) */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wishlist");
      if (saved) setWishlist(JSON.parse(saved) || []);
    } catch (err) {
      console.error("Wishlist load failed:", err);
      setWishlist([]);
    }
    hydrated.current = true;
  }, []);

  /* SAVE (always mirror to localStorage too, so a logout doesn't
     lose anything and a guest session keeps working offline) */
  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem("wishlist", JSON.stringify(wishlist || []));
  }, [wishlist]);

  /* SYNC WITH SERVER — once, when logged in. Pushes any local-only
     items up (simple one-way merge, not a full conflict UI — good
     enough per this pass's scope), then loads the server's list. */
  useEffect(() => {
    if (!isLoggedIn() || serverSynced.current) return;
    serverSynced.current = true;

    (async () => {
      try {
        const localItems = wishlist;
        for (const item of localItems) {
          try {
            await addServerWishlistItem(item.productId);
          } catch (err) {
            console.error("Wishlist push failed for", item.productId, err);
          }
        }

        const serverItems = await getServerWishlist();
        if (Array.isArray(serverItems) && serverItems.length) {
          setWishlist((prev) => {
            const byId = new Map(prev.map((p) => [p.productId, p]));
            for (const s of serverItems) {
              const id = (s as any).id || (s as any)._id;
              if (!id) continue;
              byId.set(id, {
                productId: id,
                slug: (s as any).slug || byId.get(id)?.slug || "",
                name: (s as any).name || byId.get(id)?.name || "Product",
                price: Number((s as any).price ?? byId.get(id)?.price ?? 0),
                image: byId.get(id)?.image || "/placeholder.png",
                addedAt: byId.get(id)?.addedAt || Date.now(),
              });
            }
            return Array.from(byId.values());
          });
        }
      } catch (err) {
        console.error("Wishlist server sync failed:", err);
      }
    })();
  }, [wishlist]);

  const isWishlisted = (productId: string) =>
    wishlist.some((p) => p.productId === productId);

  const addToWishlist = (product: any) => {
    if (!product) return;
    const productId = product.productId || product._id;
    if (!productId) return;

    setWishlist((prev) => {
      if (prev.some((p) => p.productId === productId)) return prev;
      return [
        ...prev,
        {
          productId,
          slug: product.slug || "",
          name: product.name || product.displayName || "Product",
          price: Number(
            product.price || product.displayPrice || product.minPrice || 0
          ),
          image: product.image || product.images?.[0] || "/placeholder.png",
          addedAt: Date.now(),
        },
      ];
    });

    if (isLoggedIn()) {
      addServerWishlistItem(productId).catch((err) =>
        console.error("Wishlist server add failed:", err)
      );
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.productId !== productId));

    if (isLoggedIn()) {
      removeServerWishlistItem(productId).catch((err) =>
        console.error("Wishlist server remove failed:", err)
      );
    }
  };

  const toggleWishlist = (product: any) => {
    const productId = product?.productId || product?._id;
    if (!productId) return;
    if (isWishlisted(productId)) removeFromWishlist(productId);
    else addToWishlist(product);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isWishlisted,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
