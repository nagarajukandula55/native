"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getProductDisplayName } from "@/lib/product";
import { getProducts, getCategories } from "@/lib/an-sdk/products";
import { getBanners } from "@/lib/an-sdk/banners";
import { getRecentReviews } from "@/lib/an-sdk/reviews";
import WishlistButton from "@/components/WishlistButton";
import RecentlyViewed from "@/components/RecentlyViewed";
import HeroSlideshow from "@/components/HeroSlideshow";
import { PINCODE_CHANGED_EVENT } from "@/lib/pincode";

// Simple keyword → emoji map so real category names (whatever the backend
// returns) still get a sensible icon without needing per-category image
// uploads. The live ANgroup /api/categories route only returns
// { id, name, slug } — no image field — so icons + a generated cover photo
// are the graceful fallback rather than fabricating asset URLs.
function iconForCategory(name = "") {
  const n = name.toLowerCase();
  if (n.includes("oil") || n.includes("ghee")) return "🫒";
  if (n.includes("flour") || n.includes("millet") || n.includes("atta") || n.includes("grain")) return "🌾";
  if (n.includes("pulse") || n.includes("lentil") || n.includes("dal")) return "🫘";
  if (n.includes("spice") || n.includes("masala")) return "🌶️";
  if (n.includes("pickle") || n.includes("chutney") || n.includes("condiment") || n.includes("sauce")) return "🥫";
  if (n.includes("dairy") || n.includes("milk") || n.includes("paneer") || n.includes("curd")) return "🥛";
  if (n.includes("snack") || n.includes("namkeen")) return "🥨";
  if (n.includes("bakery") || n.includes("bread") || n.includes("bakes")) return "🥖";
  if (n.includes("instant") || n.includes("ready to cook") || n.includes("ready-to-eat") || n.includes("ready to eat")) return "🍲";
  if (n.includes("sweet") || n.includes("mithai") || n.includes("confection")) return "🍬";
  if (n.includes("honey") || n.includes("jaggery") || n.includes("sweetener")) return "🍯";
  if (n.includes("tea") || n.includes("coffee")) return "☕";
  if (n.includes("beverage") || n.includes("juice") || n.includes("drink")) return "🥤";
  if (n.includes("rice")) return "🍚";
  if (n.includes("dry fruit") || n.includes("nut")) return "🥜";
  if (n.includes("frozen")) return "🧊";
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
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [failedCatImages, setFailedCatImages] = useState({});
  const [failedProductImages, setFailedProductImages] = useState({});
  const [dynamicSlides, setDynamicSlides] = useState(null);
  const [reviews, setReviews] = useState([]);

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

  /* ================= FETCH FEATURED PRODUCTS =================
     Admin-toggled highlight (NativeProduct.isFeatured, flipped from
     native-admin's Products > Live tab) -- independent of "newest" above,
     so a vendor's best/seasonal picks can be pinned to the homepage without
     needing to be the most recently approved products. */
  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await getProducts({ featured: true, limit: 8 });
        setFeaturedProducts(data?.products || []);
      } catch (err) {
        console.error("Featured product fetch error:", err);
        setFeaturedProducts([]);
      } finally {
        setFeaturedLoading(false);
      }
    }
    loadFeatured();
  }, []);

  /* ================= FETCH REVIEWS ================= */
  useEffect(() => {
    getRecentReviews(6)
      .then((data) => setReviews(data?.reviews || []))
      .catch(() => setReviews([]));
  }, []);

  /* ================= FETCH CATEGORIES =================
     Re-runs whenever the customer sets/changes their delivery pincode (see
     components/PincodeBar.jsx) -- some categories are only visible for
     certain pincodes (the phased "Monthly Groceries" rollout), so the tiles
     shown here need to update the moment the pincode changes, not just at
     checkout. */
  useEffect(() => {
    async function loadCategories() {
      setCategoriesLoading(true);
      try {
        const data = await getCategories();
        // /api/categories now returns every active admin category, including
        // ones with zero live products (previously filtered out server-side).
        // The homepage only has room for 4 tiles, so prefer categories that
        // actually have something to sell; ties (and the all-zero case)
        // fall back to name order, matching the API's own sort.
        const sorted = [...(data?.categories || [])].sort((a, b) => {
          const byCount = (b.productCount || 0) - (a.productCount || 0);
          if (byCount !== 0) return byCount;
          return (a.name || "").localeCompare(b.name || "");
        });
        setCategories(sorted.slice(0, 4));
      } catch (err) {
        console.error("Category fetch error:", err);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    }
    loadCategories();

    window.addEventListener(PINCODE_CHANGED_EVENT, loadCategories);
    return () => window.removeEventListener(PINCODE_CHANGED_EVENT, loadCategories);
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

  // Static fallback slide — used only when the admin hasn't configured any
  // banners yet (see dynamicSlides below). Previously this pulled real
  // catalogue product photos (products.slice(0,3).map(p => p.images?.[0])),
  // which read as a mistake -- a hero banner showing an arbitrary product
  // shot instead of a real brand/hero image. /public/hero.png is an
  // existing dedicated hero-style brand asset (not a product photo), so it
  // -- not any product image -- is the fallback here. Each slide still
  // tries a dedicated per-slide asset first (/hero/slide-N.jpg, if one is
  // ever dropped in), falling back to /hero.png, then finally to the flat
  // brand-color panel in HeroSlideshow if even that fails to load.
  const staticSlides = [
    {
      img: "/hero/slide-1.jpg",
      fallback: "/hero.png",
      eyebrow: "REFINED FROM THE SOURCE",
      heading: "Fresh Groceries,\nDelivered.",
      sub: "100% Natural | No Preservatives | Traditional & Healthy",
      ctaText: "SHOP NOW",
      ctaLink: "/products",
    },
  ];

  // Real admin-uploaded banners take priority; fall back to the static
  // set (unchanged) whenever the banner API errors or returns nothing.
  const slides = dynamicSlides && dynamicSlides.length > 0 ? dynamicSlides : staticSlides;

  // Shared product-card markup — reused by both the Featured section and
  // Best Sellers below, so there's exactly one card component on this page
  // rather than a near-duplicate copy per section.
  function renderProductCard(p) {
    const price = p.displayPrice || p.minPrice || p.price || 0;
    const stockLevel = p.stock ?? null;
    const inStock = stockLevel === null ? true : stockLevel > 0;

    const pid = p.id || p._id;
    const displayName = getProductDisplayName(p);
    const imgSrc =
      failedProductImages[pid] || !p.images?.[0] ? "/placeholder.png" : p.images[0];

    return (
      <div key={pid} className="productCard">
        <Link href={`/products/${p.slug || p._id}`} className="imgWrap">
          <img
            src={imgSrc}
            alt={displayName}
            onError={() => {
              if (!failedProductImages[pid]) {
                setFailedProductImages((prev) => ({ ...prev, [pid]: true }));
              }
            }}
          />
          {!inStock && <span className="outOfStockBadge">Out of Stock</span>}
          <div className="wishlistWrap" onClick={(e) => e.preventDefault()}>
            <WishlistButton
              product={{
                productId: p._id,
                slug: p.slug,
                name: displayName,
                price: Number(price),
                image: p.images?.[0] || "",
              }}
            />
          </div>
        </Link>

        <div className="productBody">
          <Link href={`/products/${p.slug || p._id}`} className="productLink">
            <h3>{displayName}</h3>
          </Link>
          <p className="price">{p.variantCount > 1 ? `From ₹${price}` : `₹${price}`}</p>

          <button
            className="addToCartBtn"
            disabled={!inStock}
            onClick={() => {
              if (!inStock) return;
              addToCart({
                productId: p._id,
                productKey: p.productKey,
                name: displayName,
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
  }

  return (
    <div className="home">
      {/* ================= PROMO MARQUEE ================= */}
      <div className="promoStrip">
        <div className="marqueeTrack">
          {/* Content duplicated back-to-back so the loop is seamless --
              animating one copy -50% leaves the second copy exactly
              where the first started. */}
          {[0, 1].map((copy) => (
            <div className="marqueeContent" key={copy} aria-hidden={copy === 1}>
              <span>✓ 100% Natural</span>
              <span>✓ No Preservatives</span>
              <span>✓ Traditional &amp; Healthy</span>
              <span>🚚 Free Shipping on orders above ₹499</span>
              <span>🕐 Fast Delivery in 24-48 Hrs</span>
              <span>💳 We Accept Credit/Debit Cards, UPI &amp; Net Banking</span>
            </div>
          ))}
        </div>
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
              // products load slower/fail) renders with `cover === undefined`.
              // Using a real <img> (with onError) instead of a CSS
              // background-image — a failed background-image fails silently
              // (no error event, no fallback possible), which is exactly how
              // a tile can end up rendering as an empty/collapsed box while
              // its absolutely-positioned label overlay still shows.
              const catId = cat.id || cat._id || i;
              // A real category photo (set in admin > Product Categories)
              // always wins; falls back to a matching product's own photo,
              // then finally the emoji map below.
              const rawCover =
                cat.imageUrl ||
                (!loading ? products.find((p) => p.category === cat.name)?.images?.[0] : undefined);
              // Track failed image loads in real React state rather than
              // mutating the DOM directly from onError -- a direct DOM
              // mutation (classList.add/style.display) is invisible to
              // React, so the NEXT re-render (triggered by any unrelated
              // state change elsewhere on the page) silently reverts it,
              // making a tile that had already recovered from a failed
              // image flicker back to its broken state — which is very
              // plausibly what read as "the category section closing
              // itself" without any user action.
              const cover = rawCover && !failedCatImages[catId] ? rawCover : undefined;
              return (
                <Link
                  key={catId}
                  href={`/products?category=${encodeURIComponent(catId)}`}
                  className={cover ? "catTile" : "catTile catTileNoCover"}
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt=""
                      className="catTileImg"
                      onError={() =>
                        setFailedCatImages((prev) => ({ ...prev, [catId]: true }))
                      }
                    />
                  ) : (
                    <span className="catTileIcon">{cat.icon || iconForCategory(cat.name)}</span>
                  )}
                  <div className="catTileOverlay">
                    <span className="catTileName">
                      {(cat.name || "").toUpperCase()}
                      {typeof cat.productCount === "number" ? ` (${cat.productCount})` : ""}
                    </span>
                    <span className="catTileCta">
                      {cat.productCount === 0 ? "COMING SOON" : "SHOP NOW"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= FEATURED ================= */}
      {!featuredLoading && featuredProducts.length > 0 && (
        <section id="featured" className="bestSellers">
          <h2 className="bsHeading">
            <span className="leaf">🌿</span> FEATURED <span className="leaf">🌿</span>
          </h2>
          <div className="productGrid">
            {featuredProducts.map((p) => renderProductCard(p))}
          </div>
        </section>
      )}

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
            {products.map((p) => renderProductCard(p))}
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

      {/* ================= REVIEWS ================= */}
      {reviews.length > 0 && (
        <section className="reviewsSection">
          <h2 className="bsHeading">
            <span className="leaf">🌿</span> WHAT OUR CUSTOMERS SAY <span className="leaf">🌿</span>
          </h2>
          <div className="reviewGrid">
            {reviews.map((r) => (
              <Link
                href={r.productSlug ? `/products/${r.productSlug}` : "/products"}
                key={r.id}
                className="reviewCard"
              >
                <div className="reviewStars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                {r.title && <p className="reviewTitle">{r.title}</p>}
                <p className="reviewBody">&ldquo;{r.body}&rdquo;</p>
                <p className="reviewMeta">
                  — {r.authorName}
                  {r.verifiedPurchase && <span className="verifiedTag"> · Verified Purchase</span>}
                  {r.productName && <span className="reviewProduct"> · {r.productName}</span>}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

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

        /* ===== PROMO MARQUEE ===== */
        .promoStrip {
          background: #1f3d2b;
          color: #fff;
          font-size: 13px;
          padding: 9px 0;
          overflow: hidden;
          white-space: nowrap;
        }

        .marqueeTrack {
          display: inline-flex;
          animation: marquee 26s linear infinite;
        }

        .marqueeContent {
          display: inline-flex;
          align-items: center;
          gap: 36px;
          padding-right: 36px;
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .marqueeTrack {
            animation: none;
          }
        }

        /* ===== REVIEWS ===== */
        .reviewsSection {
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .reviewGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 18px;
          margin-top: 24px;
        }

        .reviewCard {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          text-decoration: none;
          color: inherit;
          display: block;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .reviewCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.1);
        }

        .reviewStars {
          color: #f5a623;
          font-size: 15px;
          margin-bottom: 8px;
        }

        .reviewTitle {
          font-weight: 700;
          margin: 0 0 4px;
        }

        .reviewBody {
          color: #444;
          font-size: 14px;
          margin: 0 0 10px;
          line-height: 1.5;
        }

        .reviewMeta {
          font-size: 12px;
          color: #888;
          margin: 0;
        }

        .verifiedTag {
          color: #16a34a;
          font-weight: 600;
        }

        .reviewProduct {
          color: #c28b45;
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

        /* :global() on every catTile* rule below -- the outer element is a
           next/link <Link> (rendered as <a class="catTile ...">), which for
           reasons specific to this styled-jsx/Next.js combination doesn't
           receive its scoping hash class on that particular element (its
           CHILDREN do get one). A scoped rule like ".catTile.jsx-xxxx"
           therefore never matches the a element at all, so it silently fell back
           to browser default <a> styling (display:block, no height,
           position:static) -- confirmed live: the category tile collapsed
           to ~67px of unstyled text with no image/overlay, reading as a
           broken black bar of overlapping labels. :global() drops the hash
           requirement so these rules apply by plain class name regardless.
        */
        :global(.catTiles) {
          display: grid;
          /* Fixed-width columns + justify-content: center (rather than
             repeat(N, 1fr), which always stretches to fill every column
             regardless of item count) -- with fewer categories than a full
             row, the tiles cluster centered instead of hugging the left
             edge with empty space on the right. */
          grid-template-columns: repeat(auto-fit, 150px);
          justify-content: center;
          gap: 14px;
        }

        :global(.catTile) {
          position: relative;
          width: 150px;
          height: 140px;
          border-radius: 14px;
          overflow: hidden;
          background: #dfead9;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        :global(.catTileImg) {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        :global(.catTile:hover) {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.14);
        }

        /* No product cover photo yet (or products still loading) — show an
           intentional brand-colored tile instead of a bare pale box with a
           floating icon and an overlay gradient hanging over nothing. */
        :global(.catTileNoCover) {
          background: linear-gradient(160deg, #234a34, #1f3d2b 55%, #16301f);
          flex-direction: column;
          justify-content: flex-end;
        }

        :global(.catTileNoCover .catTileIcon) {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -68%);
          font-size: 28px;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));
        }

        :global(.catTileNoCover .catTileOverlay) {
          background: none;
          position: static;
          margin-top: auto;
          align-items: center;
          text-align: center;
          padding-bottom: 12px;
        }

        :global(.catTileIcon) {
          font-size: 30px;
        }

        :global(.catTileOverlay) {
          position: absolute;
          inset: auto 0 0 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        :global(.catTileName) {
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.5px;
        }

        :global(.catTileCta) {
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
          :global(.catTiles) {
            grid-template-columns: repeat(3, 1fr);
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
          :global(.catTiles) {
            grid-template-columns: repeat(2, 1fr);
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
