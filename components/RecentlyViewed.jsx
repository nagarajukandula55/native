"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * "Recently viewed" rail — reads straight from localStorage
 * (lib/recentlyViewed.ts), no backend call needed.
 */
export default function RecentlyViewed({ excludeId, title = "Recently Viewed" }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    import("@/lib/recentlyViewed").then(({ getRecentlyViewed }) => {
      setItems(getRecentlyViewed(excludeId));
    });
  }, [excludeId]);

  if (!items.length) return null;

  return (
    <section className="recentlyViewed">
      <h2>{title}</h2>

      <div className="row">
        {items.map((p) => (
          <Link href={`/products/${p.slug}`} key={p.productId} className="card">
            <img src={p.image} alt={p.name} />
            <div className="name">{p.name}</div>
            <div className="price">₹{p.price}</div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .recentlyViewed {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        h2 {
          font-size: 22px;
          margin-bottom: 18px;
        }

        .row {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 6px;
        }

        /* :global() -- this is a next/link <Link>, which (same as
           HomeClient.js's category tiles) doesn't reliably receive its
           styled-jsx scoping hash on the outer element, so a scoped
           ".card img" rule silently never matched and the image rendered
           at its natural/unconstrained size instead of the intended
           150x120 thumbnail. */
        :global(.card) {
          flex: 0 0 150px;
          text-decoration: none;
          color: inherit;
          border: 1px solid #eee;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
        }

        :global(.card img) {
          width: 100%;
          height: 120px;
          object-fit: cover;
          display: block;
        }

        .name {
          font-size: 13px;
          padding: 8px 8px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .price {
          font-size: 13px;
          font-weight: 700;
          padding: 4px 8px 10px;
          color: #c28b45;
        }
      `}</style>
    </section>
  );
}
