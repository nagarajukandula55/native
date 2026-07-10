"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

/**
 * "You may also like" cross-sell rail. Used on the product detail
 * page and the cart page. Pulls from the an-sdk products module —
 * backend just needs GET /api/products/:slug/related (see
 * backend-reference/API_CONTRACT.md → "New endpoints needed").
 */
export default function RelatedProducts({ slug, title = "You May Also Like" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const cartCtx = useCart();

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    import("@/lib/an-sdk/products").then(async ({ getRelatedProducts }) => {
      try {
        const data = await getRelatedProducts(slug);
        if (!cancelled) setProducts(data?.products || []);
      } catch (err) {
        console.error("Related products fetch failed:", err);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading || !products.length) return null;

  return (
    <section className="related">
      <h2>{title}</h2>

      <div className="grid">
        {products.map((p) => (
          <div className="card" key={p._id || p.slug}>
            <Link href={`/products/${p.slug}`}>
              <img src={p.images?.[0] || "/placeholder.png"} alt={p.name} />
              <div className="name">{p.name}</div>
              <div className="price">₹{p.displayPrice || p.minPrice || p.price || 0}</div>
            </Link>

            <button
              onClick={() =>
                cartCtx?.addToCart({
                  productId: p._id,
                  productKey: p.productKey,
                  name: p.name,
                  price: Number(p.displayPrice || p.minPrice || p.price || 0),
                  image: p.images?.[0] || "",
                  qty: 1,
                })
              }
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .related {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        h2 {
          font-size: 22px;
          margin-bottom: 18px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }

        .card {
          border: 1px solid #eee;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
          display: flex;
          flex-direction: column;
        }

        .card a {
          text-decoration: none;
          color: inherit;
        }

        .card img {
          width: 100%;
          height: 140px;
          object-fit: cover;
        }

        .name {
          font-size: 13px;
          padding: 8px 8px 0;
        }

        .price {
          font-size: 13px;
          font-weight: 700;
          padding: 4px 8px 8px;
          color: #c28b45;
        }

        .card button {
          margin: 0 8px 10px;
          padding: 9px;
          border: none;
          border-radius: 30px;
          background: #1f3d2b;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          font-size: 12px;
        }
      `}</style>
    </section>
  );
}
