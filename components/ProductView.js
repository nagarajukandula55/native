"use client";

import { useState } from "react";

export default function ProductView({ product, variants }) {
  const [selected] = useState(variants?.[0] || {});

  const mrp = selected?.mrp ?? product?.mrp ?? 0;
  const sellingPrice = selected?.sellingPrice ?? product?.sellingPrice ?? 0;

  const discount =
    mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images || [],
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand || "Generic",
    },
    offers: {
      "@type": "Offer",
      price: sellingPrice,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="page">
      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div className="container">
        <h1>{product.name}</h1>

        <p>{product.description}</p>

        <h2>₹{sellingPrice}</h2>

        {discount > 0 && <p>{discount}% OFF</p>}
      </div>
    </div>
  );
}
