"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getProductDisplayName } from "@/lib/product";
import { getProducts, getCategories } from "@/lib/an-sdk/products";
import FilterSidebar from "@/components/FilterSidebar";
import SearchBar from "@/components/SearchBar";
import WishlistButton from "@/components/WishlistButton";

export default function ProductsPageClient() {
  return (
    <Suspense fallback={<div className="container">Loading...</div>}>
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsPageInner() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const vendor = searchParams.get("vendor") || "";

  /* ================= FETCH (SEARCH + FILTERS + SORT) ================= */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getProducts({ search, category, sort, minPrice, maxPrice, vendor })
      .then((data) => {
        if (!cancelled) setProducts(data?.products || []);
      })
      .catch((err) => {
        console.error("Product fetch error:", err);
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, category, sort, minPrice, maxPrice, vendor]);

  /* ================= RESOLVE CATEGORY NAME =================
     `category` in the URL is a category _id (see FilterSidebar/homepage —
     both link/filter by _id, not name), so look up its display name for
     the heading rather than showing the raw id to the user. */
  useEffect(() => {
    if (!category) {
      setCategoryName("");
      return;
    }
    let cancelled = false;
    getCategories()
      .then((data) => {
        if (cancelled) return;
        const match = (data?.categories || []).find((c) => c._id === category);
        setCategoryName(match?.name || "");
      })
      .catch(() => {
        if (!cancelled) setCategoryName("");
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  /* ================= ADD TO CART ================= */
  function handleAddToCart(p) {
    try {
      const id = p.mongoId || p._id || p.productKey;
      if (!id) return;

      setAddingId(id);

      addToCart({
        _id: id,
        productId: id,
        productKey: p.productKey || id,
        name: p.displayName || p.name || "Product",
        slug: p.slug,
        price: Number(p.displayPrice || p.price || 0),
        mrp: Number(p.mrp || 0),
        image: p.images?.[0] || "/no-image.png",
        variant: "default",
        qty: 1,
      });
    } finally {
      setTimeout(() => setAddingId(null), 200);
    }
  }

  /* ================= SHARE ================= */
  function handleShare(p) {
    const url = `${window.location.origin}/products/${p.slug}`;

    const text = `🛍️ ${getProductDisplayName(p)}\n₹${p.displayPrice || p.price || 0}\n\n${url}`;

    if (navigator.share) {
      navigator.share({
        title: p.displayName,
        text,
        url,
      });
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text)}`,
        "_blank"
      );
    }
  }

  return (
    <div className="page">
      <FilterSidebar />

      <div className="container">
        <div className="topBar">
          <h2>
            {search
              ? `Results for "${search}"`
              : categoryName
              ? categoryName
              : category
              ? "Category"
              : "All Products"}
          </h2>
          <div className="mobileSearch">
            <SearchBar defaultValue={search} />
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : !products.length ? (
          <p>No products found{search ? ` for "${search}"` : ""}.</p>
        ) : (
          <div className="grid">
            {products.map((p) => {
              if (!p?._id || !p?.slug) return null;

              const price = p.displayPrice || p.price || 0;
              const mrp = p.mrp || 0;

              const discount =
                mrp && price ? Math.round(((mrp - price) / mrp) * 100) : 0;

              const stockLevel = p.stock ?? null;
              const inStock = stockLevel === null ? true : stockLevel > 0;

              return (
                <div className="card" key={p._id}>
                  <Link href={`/products/${p.slug}`} className="link">
                    <div className="imgWrap">
                      <img src={p.images?.[0] || "/no-image.png"} />

                      {discount > 0 && inStock && (
                        <span className="badge">{discount}% OFF</span>
                      )}
                      {!inStock && (
                        <span className="badge outOfStock">Out of Stock</span>
                      )}
                    </div>

                    <div className="content">
                      <h3>{p.displayName}</h3>

                      {/* SOLD BY (multi-vendor) */}
                      {p.vendor && (
                        <p className="soldBy">
                          Sold by {p.vendor.name || p.vendor.businessName}
                        </p>
                      )}

                      {/* SIZE */}
                      {p.sizeValue && (
                        <p style={{ fontSize: "12px", color: "#666" }}>
                          {p.sizeValue} {p.sizeUnit}
                        </p>
                      )}

                      {/* SHORT DESCRIPTION */}
                      {p.shortDescription && (
                        <p style={{ fontSize: "12px", color: "#888", marginTop: 4 }}>
                          {p.shortDescription.slice(0, 60)}...
                        </p>
                      )}

                      <p className="price">
                        <b>₹{price}</b>
                        {mrp > price && (
                          <span className="mrp">₹{mrp}</span>
                        )}
                      </p>
                    </div>
                  </Link>

                  <div className="wishlistWrap">
                    <WishlistButton
                      product={{
                        productId: p._id,
                        slug: p.slug,
                        name: p.displayName || p.name,
                        price,
                        image: p.images?.[0] || "",
                      }}
                    />
                  </div>

                  <div className="actions">
                    <button
                      onClick={() => handleAddToCart(p)}
                      disabled={addingId === p._id || !inStock}
                      className="btn"
                    >
                      {!inStock
                        ? "Out of Stock"
                        : addingId === p._id
                        ? "Adding..."
                        : "Add to Cart"}
                    </button>

                    <button onClick={() => handleShare(p)} className="share">
                      Share
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= SEO JSON-LD ================= */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: products.slice(0, 10).map((p, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: p.displayName,
                url: `https://shopnative.in/products/${p.slug}`,
              })),
            }),
          }}
        />
      </div>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .page {
          display: flex;
          align-items: flex-start;
          max-width: 1400px;
          margin: 0 auto;
        }

        .container {
          flex: 1;
          padding: 20px;
        }

        .topBar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .mobileSearch {
          display: none;
          width: 100%;
        }

        @media (max-width: 900px) {
          .page {
            flex-direction: column;
          }

          .mobileSearch {
            display: block;
          }
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        .card {
          position: relative;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #eee;
          display: flex;
          flex-direction: column;
        }

        .imgWrap {
          position: relative;
        }

        .imgWrap img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: red;
          color: #fff;
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 5px;
        }

        .badge.outOfStock {
          background: #6b7280;
        }

        .wishlistWrap {
          position: absolute;
          top: 10px;
          right: 10px;
        }

        .content {
          padding: 12px;
        }

        .price {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .mrp {
          text-decoration: line-through;
          color: #888;
        }

        .soldBy {
          font-size: 11px;
          color: #c28b45;
          font-weight: 600;
          margin: 2px 0 0;
        }

        .actions {
          display: flex;
          gap: 10px;
          padding: 10px;
        }

        .btn {
          flex: 1;
          padding: 10px;
          background: black;
          color: white;
          border: none;
          border-radius: 8px;
        }

        .btn:disabled {
          background: #aaa;
        }

        .share {
          padding: 10px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
