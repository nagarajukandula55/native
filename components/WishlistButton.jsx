"use client";

import { useWishlist } from "@/context/WishlistContext";

/**
 * Reusable heart-toggle button. Drop onto any product card or the
 * product detail page — it only needs the product object that's
 * already on hand (no extra fetch).
 */
export default function WishlistButton({ product, className = "" }) {
  const wishlistCtx = useWishlist();

  if (!wishlistCtx || !product) return null;

  const { isWishlisted, toggleWishlist } = wishlistCtx;
  const productId = product.productId || product._id;
  const active = isWishlisted?.(productId);

  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
      }}
      className={`wishlistBtn ${className}`}
    >
      {active ? "♥" : "♡"}

      <style jsx>{`
        .wishlistBtn {
          border: none;
          background: rgba(255, 255, 255, 0.9);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          color: ${active ? "#e0245e" : "#555"};
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transition: transform 0.15s ease;
        }

        .wishlistBtn:hover {
          transform: scale(1.08);
        }
      `}</style>
    </button>
  );
}
