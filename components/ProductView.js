"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getProductDisplayName } from "@/lib/product";
import WishlistButton from "./WishlistButton";
import RelatedProducts from "./RelatedProducts";
import RecentlyViewed from "./RecentlyViewed";
import ReviewsSection from "./ReviewsSection";
import RelatedReads from "./RelatedReads";
import { trackProductView } from "@/lib/recentlyViewed";

export default function ProductView({
  product,
  variants = [],
}) {
  const { addToCart } = useCart();

  /* Track this view for the "Recently Viewed" rail (client-only, no
     backend dependency). */
  useEffect(() => {
    if (product) trackProductView(product);
  }, [product]);

  const [selectedImage, setSelectedImage] = useState(
    product?.images?.[0] || ""
  );

  const [selectedVariant, setSelectedVariant] = useState(
    variants?.[0] || {}
  );

  const mrp =
    selectedVariant?.mrp ??
    product?.mrp ??
    product?.price ??
    0;

  const sellingPrice =
    selectedVariant?.sellingPrice ??
    product?.sellingPrice ??
    product?.price ??
    0;

  // Stock is tracked per-variant when variants exist, else on the product
  // itself (see models/Product.js `stock` field in backend-reference).
  // Previously there was no out-of-stock handling anywhere on the
  // customer-facing site — Add to Cart worked (or silently failed later)
  // regardless, and structured data always claimed "InStock".
  const stockLevel =
    selectedVariant?.stock ?? product?.stock ?? null;
  const inStock = stockLevel === null ? true : stockLevel > 0;
  const lowStock = inStock && stockLevel !== null && stockLevel <= 5;

  const discount =
    mrp > 0
      ? Math.round(
          ((mrp - sellingPrice) / mrp) * 100
        )
      : 0;

  const images =
    product?.images?.map((img) =>
      img.replace(/\[|\]/g, "").split(")(")[0]
    ) || [];

  const displayName = getProductDisplayName(product);

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      productId: product._id,
      productKey: product.productKey,
      name: displayName,
      slug: product.slug,
      price: sellingPrice,
      mrp,
      // Checkout's order summary computes GST per line item from this --
      // was never set, so the GST row always computed to 0 and silently
      // never rendered (checkout only showed Subtotal / Grand Total).
      tax: product.taxRate ?? 0,
      image: selectedImage,
      variant:
        selectedVariant?.value
          ? `${selectedVariant.value}${selectedVariant.unit}`
          : "Default",
      qty: 1,
    });
  };

  const handleShare = () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: displayName,
        text: displayName,
        url,
      });
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          `${displayName}\n${url}`
        )}`,
        "_blank"
      );
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayName,
    image: images,
    description: product?.description,
    brand: {
      "@type": "Brand",
      name: product?.brand || "Native",
    },
    offers: {
      "@type": "Offer",
      price: sellingPrice,
      priceCurrency: "INR",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData
          ),
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(350px,1fr))",
            gap: "40px",
          }}
        >
          {/* LEFT */}
          <div>
            {selectedImage && (
              <img
                src={selectedImage}
                alt={displayName}
                style={{
                  width: "100%",
                  borderRadius: "12px",
                }}
              />
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "10px",
                flexWrap: "wrap",
              }}
            >
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() =>
                    setSelectedImage(img)
                  }
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    cursor: "pointer",
                    border:
                      selectedImage === img
                        ? "2px solid #000"
                        : "1px solid #ddd",
                  }}
                />
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <h1>{displayName}</h1>

            {product?.vendor && (
              <Link
                href={`/vendors/${product.vendor.id || product.vendor._id}`}
                style={{
                  display: "inline-block",
                  fontSize: "13px",
                  color: "#c28b45",
                  fontWeight: 600,
                  textDecoration: "none",
                  marginBottom: "6px",
                }}
              >
                Sold by {product.vendor.name || product.vendor.businessName}
              </Link>
            )}

            <div
              style={{
                margin: "20px 0",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              >
                ₹{sellingPrice}
              </span>

              {mrp > sellingPrice && (
                <>
                  <span
                    style={{
                      marginLeft: "10px",
                      textDecoration:
                        "line-through",
                      color: "#888",
                    }}
                  >
                    ₹{mrp}
                  </span>

                  <span
                    style={{
                      marginLeft: "10px",
                      color: "green",
                      fontWeight: "700",
                    }}
                  >
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {variants.length > 0 && (
              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <strong>Size:</strong>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  {variants.map((v) => {
                    const active = selectedVariant?._id === v._id;
                    return (
                      <button
                        key={v._id}
                        onClick={() => setSelectedVariant(v)}
                        className={active ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                      >
                        {v.value}
                        {v.unit}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p>
              {product.description}
            </p>

            {!inStock ? (
              <p
                style={{
                  color: "#e11d48",
                  fontWeight: 700,
                  margin: "10px 0",
                }}
              >
                Out of Stock
              </p>
            ) : lowStock ? (
              <p
                style={{
                  color: "#b45309",
                  fontWeight: 600,
                  margin: "10px 0",
                  fontSize: "13px",
                }}
              >
                Only {stockLevel} left in stock — order soon
              </p>
            ) : null}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "25px",
              }}
            >
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="btn btn-accent"
                style={{
                  flex: 1,
                  background: inStock ? undefined : "#aaa",
                  cursor: inStock ? "pointer" : "not-allowed",
                }}
              >
                {inStock ? "Add To Cart" : "Out of Stock"}
              </button>

              <button
                onClick={handleShare}
                className="btn btn-secondary"
              >
                Share
              </button>

              <WishlistButton
                product={{
                  productId: product._id,
                  slug: product.slug,
                  name: displayName,
                  price: sellingPrice,
                  image: selectedImage,
                }}
              />
            </div>

            <hr
              style={{
                margin: "30px 0",
              }}
            />

            {product?.ingredients?.length > 0 && (
              <>
                <h3>Ingredients</h3>
                <p>{product.ingredients.join(", ")}</p>
              </>
            )}

            {product?.allergens?.length > 0 && (
              <div
                style={{
                  background: "#fff8e6",
                  border: "1px solid #f0d78c",
                  borderRadius: 8,
                  padding: "10px 14px",
                  margin: "12px 0",
                }}
              >
                <strong>Allergens: </strong>
                {product.allergens.join(", ")}
              </div>
            )}

            {product?.warnings?.length > 0 && (
              <ul style={{ color: "#b45309", fontSize: 14 }}>
                {product.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}

            {product?.nutrition && (
              <>
                <h3>Nutrition Facts</h3>
                <p style={{ fontSize: 13, color: "#666", marginTop: -6 }}>
                  Per {product.nutrition.servingSize}g serving
                </p>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <tbody>
                    {[
                      ["Energy", `${product.nutrition.energy} kcal`],
                      ["Protein", `${product.nutrition.protein} g`],
                      ["Carbohydrates", `${product.nutrition.carbs} g`],
                      ["  Sugars", `${product.nutrition.sugars} g`],
                      ["Fat", `${product.nutrition.fat} g`],
                      ["Sodium", `${product.nutrition.sodium} mg`],
                    ].map(([label, value]) => (
                      <tr key={label} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "6px 0", color: label.startsWith("  ") ? "#888" : "#333" }}>
                          {label.trim()}
                        </td>
                        <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600 }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {product?.usageInstructions && (
              <>
                <h3>Usage Instructions</h3>
                <p>{product.usageInstructions}</p>
              </>
            )}

            {product?.storageInstructions && (
              <>
                <h3>Storage Instructions</h3>
                <p>{product.storageInstructions}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <ReviewsSection productId={product._id} />

      <RelatedReads category={product.category} />

      <RelatedProducts slug={product.slug} />

      <RecentlyViewed excludeId={product._id} />
    </>
  );
}
