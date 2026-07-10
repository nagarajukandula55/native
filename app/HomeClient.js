"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getProducts, getCategories } from "@/lib/an-sdk/products";
import { getBanners } from "@/lib/an-sdk/banners";
import WishlistButton from "@/components/WishlistButton";
import RecentlyViewed from "@/components/RecentlyViewed";
import HeroSlideshow from "@/components/HeroSlideshow";

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
  const [dynamicSlides, setDynamicSlides] = useState(null);

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

  /* ================= FETCH BANNERS (admin-uploaded hero slides) =========
     Preferred-first-source: if the banner API returns real, active banners
     they replace the hardcoded slides below; any failure or an empty list
     leaves dynamicSlides null so the static 3-slide fallback (unchanged)
     keeps working — the homepage never breaks on this call. */
  useEffect(() => {
    async function loadBanners() {
      try {
        const { success, banners } = await getBanners();
        if (success && Array.isArray(banners) && banners.length > 0) {
          setDynamicSlides(
            banners.map((b) => ({
              img: b.imageUrl,
              fallback: b.imageUrl,
              eyebrow: b.subheading || "",
              heading: b.heading || "",
              sub: b.subheading || "",
              ctaText: b.ctaText || "SHOP NOW",
              ctaLink: b.ctaLink || "/products",
            }))
          );
        }
      } catch (err) {
        console.error("Banner fetch error:", err);
      }
    }
    loadBanners();
  }, []);

  // Real product photos (from the live catalogue), used as slideshow
  // backgrounds when a dedicated hero asset isn't present at /hero/slide-N.jpg
  // — see HeroSlideshow below for the fallback chain.
  const heroImages = products.slice(0, 3).map((p) => p.images?.[0]).filter(Boolean);

  // Slide content — each slide expects a full-bleed banner image at
  // /public/hero/slide-1.jpg, slide-2.jpg, slide-3.jpg. Drop real
  // photography there (e.g. the product-lineup banner) to replace the
  // fallback, which reuses real catalogue product photos so the slideshow
  // never shows a broken image even before those assets exist.
  const staticSlides = [
    {
      img: "/hero/slide-1.jpg",
      fallback: heroImages[0] || "/hero.png",
      eyebrow: "REFINED FROM THE SOURCE",
      heading: "Eat Healthy,\nStay Healthy",
      sub: "100% Natural | No Preservatives | Traditional & Healthy",
    },
    {
      img: "/hero/slide-2.jpg",
      fallback: heroImages[1] || heroImages[0] || "/hero.png",
      eyebrow: "STONE-GROUND · SUN-DRIED",
      heading: "Traditional Recipes,\nModern Convenience",
      sub: "Sourced directly from farmers across India — no shortcuts, no additives.",
    },
    {
      img: "/hero/slide-3.jpg",
      fallback: heroImages[2] || heroImages[0] || "/hero.png",
      eyebrow: "FSSAI CERTIFIED",
      heading: "Every Pack,\nNaturally Made",
      sub: "From our kitchens to yours — nutrition without compromise.",
    },
  ];

  // Real admin-uploaded banners take priority; fall back to the static
  // set (unchanged) whenever the banner API errors or returns nothing.
  const slides = dynamicSlides && dynamicSlides.length > 0 ? dynamicSlides : staticSlides;

  return (
    <div className="home">
      {/* ================= PROMO STRIP ================= */}
      <div className="promoStrip">
        <span>✓ 100% Natural &nbsp;|&nbsp; ✓ No Preservatives &nbsp;|&nbsp; ✓ Traditional &amp; Healthy</span>
        <span className="promoCenter">🚚 Free Shipping on orders above ₹499</span>
        <span>🕐 Fast Delivery in 24-48 Hrs</span>
      </div>

      {/* ================= HERO SLIDESHOW ================= */}
      <HeroSlideshow slides={slides} />

      {/* ================= FEATURE STRIP (moved out of hero so it reads
          cleanly under the full-bleed slideshow rather than overlaid on
          a photo) ================= */}
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

      {/* ================= CATEGORY TILES ================= */}
      <section id="categories" className="catSection">
        {categoriesLoading ? (
          <p className="center">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="center">No categories found</p>
        ) : (
          <div className="catTiles">
            {categories.map((cat, i) => {
              // Only trust a cover photo once the products fetch has actually
              // finished — otherwise every tile briefly (or permanently, if
              // products load slower/fail) renders with `cover === undefined`
              // which used to fall back to a bare pale-green box with a
              // floating icon and a gradient hanging over nothing, reading as
              // "broken" rather than intentional.
              const cover = !loading
                ? products.find((p) => p.category === cat.name)?.images?.[0]
                : undefined;
              const catId = cat.id || cat._id || i;
              return (
                <Link
                  key={catId}
                  href={`/products?category=${encodeURIComponent(catId)}`}
                  className={cover ? "catTile" : "catTile catTileNoCover"}
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
          {/* Support phone not exposed by GET /api/businesses/public
              (only name/logo/favicon/industry) — reuse the real WhatsApp
              support number shown in Footer.js. */}
          <span>+91 89852 29693</span>
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

        /* ===== FEATURE STRIP (below the hero slideshow) ===== */
        .heroFeatures {
          display: flex;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
          background: linear-gradient(135deg, #f5ecd9, #ede0c4);
          padding: 26px 24px;
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
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .catTile:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.14);
        }

        /* No product cover photo yet (or products still loading) — show an
           intentional brand-colored tile instead of a bare pale box with a
           floating icon and an overlay gradient hanging over nothing. */
        .catTileNoCover {
          background: linear-gradient(160deg, #234a34, #1f3d2b 55%, #16301f);
          flex-direction: column;
          justify-content: flex-end;
        }

        .catTileNoCover .catTileIcon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -68%);
          font-size: 44px;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));
        }

        .catTileNoCover .catTileOverlay {
          background: none;
          position: static;
          margin-top: auto;
          align-items: center;
          text-align: center;
          padding-bottom: 22px;
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
