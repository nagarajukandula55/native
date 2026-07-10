"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getProducts, getCategories } from "@/lib/an-sdk/products";
import WishlistButton from "@/components/WishlistButton";
import RecentlyViewed from "@/components/RecentlyViewed";

// Simple keyword → emoji map so real category names (whatever the backend
// returns) still get a sensible icon without needing per-category image
// uploads. The live ANgroup /api/categories route only returns
// { id, name, slug } — no image field — so icons + a generated cover photo
// are the graceful fallback rather than fabricating asset URLs.
function iconForCategory(name = "") {
  const n = name.toLowerCase();
  if (n.includes("oil")) return "🫒";
  if (n.includes("flour") || n.includes("millet") || n.includes("atta")) return "🌾";
  if (n.includes("spice") || n.includes("masala")) return "🌶️";
  if (n.includes("pickle") || n.includes("chutney")) return "🥒";
  if (n.includes("snack") || n.includes("namkeen")) return "🥨";
  if (n.includes("instant") || n.includes("ready to cook")) return "🍲";
  if (n.includes("ready to eat")) return "🍱";
  if (n.includes("sweet") || n.includes("mithai")) return "🍯";
  if (n.includes("tea") || n.includes("coffee")) return "☕";
  if (n.includes("rice") || n.includes("grain")) return "🌾";
  if (n.includes("dry fruit") || n.includes("nut")) return "🥜";
  if (n.includes("electronic")) return "🔌";
  if (n.includes("fashion")) return "👕";
  if (n.includes("appliance")) return "🏠";
  if (n.includes("mobile") || n.includes("accessor")) return "📱";
  return "🌿";
}

export default function HomeClient() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts({ sort: "newest", limit: 6 });
        const list = data?.products || [];
        setProducts(list);
      } catch (err) {
        console.error("Product fetch error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories((data?.categories || []).slice(0, 4));
      } catch (err) {
        console.error("Category fetch error:", err);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    }
    loadCategories();
  }, []);

  // Real product photos (from the live catalogue) used inside the hero
  // collage instead of a fabricated "5 pouches" studio shot — there is no
  // matching asset for that in public/, so this reuses whatever the first
  // few real products actually look like.
  const heroImages = products.slice(0, 3).map((p) => p.images?.[0]).filter(Boolean);

  return (
    <div className="home">
      {/* ================= PROMO STRIP ================= */}
      <div className="promoStrip">
        <span>✓ 100% Natural &nbsp;|&nbsp; ✓ No Preservatives &nbsp;|&nbsp; ✓ Traditional &amp; Healthy</span>
        <span className="promoCenter">🚚 Free Shipping on orders above ₹499</span>
        <span>🕐 Fast Delivery in 24-48 Hrs</span>
      </div>

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="heroInner">
          <div className="heroLeft">
            <h1>
              Eat Healthy,
              <br />
              Stay Healthy
            </h1>
            <p className="heroSub">
              100% Natural | No Preservatives
              <br />
              Traditional &amp; Healthy
            </p>

            <Link href="/products" className="shopNowBtn">
              SHOP NOW
            </Link>

            <div className="heroFeatures">
              {[
                ["🌿", "100% Natural"],
                ["🚫", "No Preservatives"],
                ["🍲", "Traditional Foods"],
                ["❤️", "Made with Love"],
              ].map(([icon, label]) => (
                <div key={label} className="heroFeature">
                  <span className="heroFeatureIcon">{icon}</span>
                  <span className="heroFeatureLabel">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="heroRight">
            {heroImages.length > 0 ? (
              <div className="heroCollage">
                {heroImages.map((src, i) => (
                  <img key={i} src={src} alt="Native product" className={`heroImg heroImg${i}`} />
                ))}
              </div>
            ) : (
              <img src="/hero.png" alt="Native natural products" className="heroFallbackImg" />
            )}
          </div>
        </div>
      </section>

      {/* ================= CATEGORY TILES ================= */}
      <section id="categories" className="catSection">
        {categoriesLoading ? (
          <p className="center">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="center">No categories found</p>
        ) : (
          <div className="catTiles">
            {categories.map((cat, i) => {
              const cover = products.find((p) => p.category === cat.name)?.images?.[0];
              return (
                <Link
                  key={cat.id || cat._id || i}
                  href={`/products?category=${encodeURIComponent(cat.id || cat._id)}`}
                  className="catTile"
                  style={cover ? { backgroundImage: `url(${cover})` } : undefined}
                >
                  {!cover && <span className="catTileIcon">{iconForCategory(cat.name)}</span>}
                  <div className="catTileOverlay">
                    <span className="catTileName">{(cat.name || "").toUpperCase()}</span>
                    <span className="catTileCta">SHOP NOW</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= BEST SELLERS ================= */}
      <section id="products" className="bestSellers">
        <h2 className="bsHeading">
          <span className="leaf">🌿</span> BEST SELLERS <span className="leaf">🌿</span>
        </h2>

        {loading ? (
          <p className="center">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="center">No products found</p>
        ) : (
          <div className="productGrid">
            {products.map((p) => {
              const price = p.displayPrice || p.minPrice || p.price || 0;
              const mrp = p.mrp || 0;
              const stockLevel = p.stock ?? null;
              const inStock = stockLevel === null ? true : stockLevel > 0;

              return (
                <div key={p.id || p._id} className="productCard">
                  <Link href={`/products/${p.slug || p._id}`} className="imgWrap">
                    <img src={p.images?.[0] || "/placeholder.png"} alt={p.name} />
                    {!inStock && <span className="outOfStockBadge">Out of Stock</span>}
                    <div className="wishlistWrap" onClick={(e) => e.preventDefault()}>
                      <WishlistButton
                        product={{
                          productId: p._id,
                          slug: p.slug,
                          name: p.name,
                          price: Number(price),
                          image: p.images?.[0] || "",
                        }}
                      />
                    </div>
                  </Link>

                  <div className="productBody">
                    <Link href={`/products/${p.slug || p._id}`} className="productLink">
                      <h3>{p.name}</h3>
                    </Link>
                    <p className="price">₹{price}</p>

                    <button
                      className="addToCartBtn"
                      disabled={!inStock}
                      onClick={() => {
                        if (!inStock) return;
                        addToCart({
                          productId: p._id,
                          productKey: p.productKey,
                          name: p.name,
                          slug: p.slug,
                          price: Number(price),
                          image: p.images?.[0] || "",
                          qty: 1,
                        });
                      }}
                    >
                      {inStock ? "ADD TO CART" : "OUT OF STOCK"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="viewAllWrap">
          <Link href="/products" className="viewAllBtn">
            View All Products
          </Link>
        </div>
      </section>

      {/* ================= TRUST BADGES ================= */}
      <section className="trustStrip">
        <div className="trustItem">
          <span className="trustIcon">🚚</span>
          <strong>FREE SHIPPING</strong>
          <span>On orders above ₹499</span>
        </div>
        <div className="trustItem">
          <span className="trustIcon">🕐</span>
          <strong>FAST DELIVERY</strong>
          <span>Dispatch within 24-48 hrs</span>
        </div>
        <div className="trustItem">
          <span className="trustIcon">🛡️</span>
          <strong>SECURE PAYMENT</strong>
          <span>100% Secure Payments</span>
        </div>
        <div className="trustItem">
          <span className="trustIcon">🌿</span>
          <strong>100% NATURAL</strong>
          <span>No Preservatives</span>
        </div>
        <div className="trustItem">
          <span className="trustIcon">🎧</span>
          <strong>CUSTOMER SUPPORT</strong>
          {/* No support phone is exposed by GET /api/businesses/public
              (only name/logo/favicon/industry) — placeholder until a real
              number is configured. */}
          <span>+91 8XXXX XXXXX</span>
        </div>
      </section>

      {/* ================= RECENTLY VIEWED ================= */}
      <RecentlyViewed />

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .home {
          font-family: var(--font-body, system-ui);
          overflow-x: hidden;
        }

        .center {
          text-align: center;
          padding: 20px;
        }

        /* ===== PROMO STRIP ===== */
        .promoStrip {
          background: #1f3d2b;
          color: #fff;
          font-size: 13px;
          padding: 8px 20px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 8px;
          text-align: center;
        }

        .promoCenter {
          flex: 1;
          text-align: center;
        }

        /* ===== HERO ===== */
        .hero {
          background: linear-gradient(135deg, #f5ecd9, #ede0c4);
          padding: 50px 24px;
        }

        .heroInner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        .heroLeft {
          flex: 1 1 420px;
          min-width: 280px;
        }

        .heroLeft h1 {
          font-family: var(--font-heading, serif);
          font-size: clamp(32px, 5vw, 56px);
          color: #1f3d2b;
          margin: 0 0 12px;
          line-height: 1.1;
        }

        .heroSub {
          font-style: italic;
          font-size: clamp(15px, 2vw, 19px);
          color: #4a5d43;
          margin: 0 0 24px;
        }

        .shopNowBtn {
          display: inline-block;
          background: #1f3d2b;
          color: #fff;
          padding: 14px 36px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .shopNowBtn:hover {
          background: #16301f;
        }

        .heroFeatures {
          display: flex;
          gap: 20px;
          margin-top: 36px;
          flex-wrap: wrap;
        }

        .heroFeature {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 90px;
          text-align: center;
        }

        .heroFeatureIcon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
        }

        .heroFeatureLabel {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #333;
        }

        .heroRight {
          flex: 1 1 380px;
          min-width: 260px;
          max-width: 100%;
        }

        .heroCollage {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .heroImg {
          width: 140px;
          height: 180px;
          object-fit: cover;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
          max-width: 100%;
        }

        .heroImg1 {
          transform: translateY(-16px);
        }

        .heroFallbackImg {
          width: 100%;
          max-width: 480px;
          height: auto;
          border-radius: 16px;
          display: block;
          margin: 0 auto;
        }

        /* ===== CATEGORY TILES ===== */
        .catSection {
          max-width: 1200px;
          margin: 0 auto;
          padding: 28px 20px 0;
        }

        .catTiles {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .catTile {
          position: relative;
          height: 220px;
          border-radius: 16px;
          overflow: hidden;
          background: #dfead9 center/cover no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .catTileIcon {
          font-size: 48px;
        }

        .catTileOverlay {
          position: absolute;
          inset: auto 0 0 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .catTileName {
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.5px;
        }

        .catTileCta {
          color: #f0e6c8;
          font-size: 12px;
          font-weight: 600;
        }

        /* ===== BEST SELLERS ===== */
        .bestSellers {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 20px;
        }

        .bsHeading {
          text-align: center;
          font-family: var(--font-heading, serif);
          color: #1f3d2b;
          font-size: clamp(24px, 3.5vw, 34px);
          letter-spacing: 1px;
          margin-bottom: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }

        .leaf {
          font-size: 20px;
        }

        .productGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
        }

        .productCard {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #eee;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .imgWrap {
          position: relative;
          display: block;
        }

        .productCard img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          display: block;
        }

        .outOfStockBadge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #6b7280;
          color: #fff;
          padding: 4px 8px;
          font-size: 11px;
          border-radius: 5px;
        }

        .wishlistWrap {
          position: absolute;
          top: 10px;
          right: 10px;
        }

        .productBody {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .productLink {
          text-decoration: none;
          color: inherit;
        }

        .productBody h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #222;
        }

        .price {
          font-weight: 700;
          font-size: 16px;
          color: #1f3d2b;
          margin: 0;
        }

        .addToCartBtn {
          margin-top: auto;
          width: 100%;
          padding: 10px;
          background: #fff;
          border: 1.5px solid #111;
          color: #111;
          border-radius: 8px;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.5px;
          cursor: pointer;
        }

        .addToCartBtn:hover:not(:disabled) {
          background: #111;
          color: #fff;
        }

        .addToCartBtn:disabled {
          border-color: #ccc;
          color: #999;
          cursor: not-allowed;
        }

        .viewAllWrap {
          text-align: center;
          margin-top: 36px;
        }

        .viewAllBtn {
          display: inline-block;
          background: #1f3d2b;
          color: #fff;
          padding: 14px 35px;
          border-radius: 30px;
          font-size: 15px;
          text-decoration: none;
          font-weight: 600;
        }

        .viewAllBtn:hover {
          background: #16301f;
        }

        /* ===== TRUST STRIP ===== */
        .trustStrip {
          background: #f5ecd9;
          padding: 40px 20px;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
          text-align: center;
        }

        .trustItem {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .trustIcon {
          font-size: 26px;
          margin-bottom: 6px;
        }

        .trustItem strong {
          font-size: 13px;
          color: #1f3d2b;
          letter-spacing: 0.3px;
        }

        .trustItem span:last-child {
          font-size: 12px;
          color: #666;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 900px) {
          .catTiles {
            grid-template-columns: repeat(2, 1fr);
          }

          .trustStrip {
            grid-template-columns: repeat(2, 1fr);
          }

          .promoStrip {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .catTiles {
            grid-template-columns: 1fr;
          }

          .trustStrip {
            grid-template-columns: 1fr;
          }

          .productGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .heroFeatures {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
