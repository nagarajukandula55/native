"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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

const PAGE_SIZE = 24;

function ProductsPageInner() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const vendor = searchParams.get("vendor") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  function goToPage(nextPage) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ================= FETCH (SEARCH + FILTERS + SORT + PAGE) ================= */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getProducts({ search, category, sort, minPrice, maxPrice, vendor, page, limit: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return;
        setProducts(data?.products || []);
        setTotalPages(data?.totalPages || 1);
      })
      .catch((err) => {
        console.error("Product fetch error:", err);
        if (!cancelled) {
          setProducts([]);
          setTotalPages(1);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, category, sort, minPrice, maxPrice, vendor, page]);

  // Any filter/search/sort change should reset back to page 1 -- otherwise
  // e.g. narrowing a search while sitting on page 5 could land on an
  // out-of-range page with zero results even though matches exist. Skips
  // the very first run so landing directly on a shared ?page=3 link isn't
  // immediately reset to page 1.
  const isFirstRun = useRef(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (page !== 1) goToPage(1);
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
        name: getProductDisplayName(p) || "Product",
        slug: p.slug,
        price: Number(p.displayPrice || p.price || 0),
        mrp: Number(p.mrp || 0),
        image: p.images?.[0] || "/placeholder.png",
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
        title: getProductDisplayName(p),
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
              const displayName = getProductDisplayName(p);

              return (
                <div className="card" key={p._id}>
                  <Link href={`/products/${p.slug}`} className="link">
                    <div className="imgWrap">
                      <img src={p.images?.[0] || "/placeholder.png"} alt={displayName} />

                      {discount > 0 && inStock && (
                        <span className="badge">{discount}% OFF</span>
                      )}
                      {!inStock && (
                        <span className="badge outOfStock">Out of Stock</span>
                      )}
                    </div>

                    <div className="content">
                      <h3>{displayName}</h3>

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
                          {p.shortDescription.slice(0, 60)}
                          {p.shortDescription.length > 60 ? "..." : ""}
                        </p>
                      )}

                      <p className="price">
                        {p.variantCount > 1 ? (
                          <b>From ₹{price}</b>
                        ) : (
                          <>
                            <b>₹{price}</b>
                            {mrp > price && (
                              <span className="mrp">₹{mrp}</span>
                            )}
                          </>
                        )}
                      </p>
                      {p.variantCount > 1 && (
                        <p style={{ fontSize: "11px", color: "#888" }}>{p.variantCount} sizes available</p>
                      )}
                    </div>
                  </Link>

                  <div className="wishlistWrap">
                    <WishlistButton
                      product={{
                        productId: p._id,
                        slug: p.slug,
                        name: displayName,
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

        {!loading && products.length > 0 && totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="pageBtn"
            >
              ← Prev
            </button>
            <span className="pageInfo">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="pageBtn"
            >
              Next →
            </button>
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
                name: getProductDisplayName(p),
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
          background: #1f3d2b;
          color: white;
          border: none;
          border-radius: 30px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: background 160ms ease;
        }

        .btn:hover:not(:disabled) {
          background: #16301f;
        }

        .btn:disabled {
          background: #aaa;
          cursor: not-allowed;
        }

        .share {
          padding: 10px 16px;
          border: 1.5px solid #1f3d2b;
          background: white;
          color: #1f3d2b;
          border-radius: 30px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: background 160ms ease, color 160ms ease;
        }

        .share:hover {
          background: #1f3d2b;
          color: #fff;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 32px;
        }

        .pageBtn {
          padding: 10px 20px;
          border: 1.5px solid #1f3d2b;
          background: white;
          color: #1f3d2b;
          border-radius: 30px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }

        .pageBtn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pageBtn:hover:not(:disabled) {
          background: #1f3d2b;
          color: #fff;
        }

        .pageInfo {
          font-size: 13px;
          color: #666;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
