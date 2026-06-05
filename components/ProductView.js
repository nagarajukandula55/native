"use client";

import { useState } from "react";

export default function ProductView({
  product,
  variants = [],
}) {
  const [selected] = useState(
    variants?.[0] || {}
  );

  const mrp =
    selected?.mrp ??
    product?.mrp ??
    0;

  const sellingPrice =
    selected?.sellingPrice ??
    product?.sellingPrice ??
    0;

  const discount =
    mrp > 0
      ? Math.round(
          ((mrp - sellingPrice) / mrp) * 100
        )
      : 0;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.name || "",
    image: product?.images || [],
    description:
      product?.description || "",
    brand: {
      "@type": "Brand",
      name:
        product?.brand || "Native",
    },
    offers: {
      "@type": "Offer",
      price: sellingPrice,
      priceCurrency: "INR",
      availability:
        "https://schema.org/InStock",
    },
  };

  return (
    <>
      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData
          ),
        }}
      />

      <div
        className="container"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        {/* Product Image */}
        {product?.images?.length > 0 && (
          <img
            src={product.images[0]}
            alt={product.name}
            style={{
              width: "100%",
              maxWidth: "500px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          />
        )}

        {/* Product Name */}
        <h1>
          {product?.name || "Product"}
        </h1>

        {/* Description */}
        <p>
          {product?.description ||
            "No description available"}
        </p>

        {/* Price */}
        <div
          style={{
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <h2>
            ₹{sellingPrice}
          </h2>

          {mrp > sellingPrice && (
            <p>
              <span
                style={{
                  textDecoration:
                    "line-through",
                  color: "#888",
                  marginRight: "10px",
                }}
              >
                ₹{mrp}
              </span>

              <span
                style={{
                  color: "green",
                  fontWeight: "bold",
                }}
              >
                {discount}% OFF
              </span>
            </p>
          )}
        </div>

        {/* Brand */}
        {product?.brand && (
          <p>
            <strong>Brand:</strong>{" "}
            {product.brand}
          </p>
        )}

        {/* Category */}
        {product?.category && (
          <p>
            <strong>Category:</strong>{" "}
            {product.category}
          </p>
        )}

        {/* Stock */}
        <p>
          <strong>Stock:</strong>{" "}
          {selected?.stock ??
            product?.stock ??
            0}
        </p>
      </div>
    </>
  );
}
