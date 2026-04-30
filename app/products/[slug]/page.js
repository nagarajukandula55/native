import ProductView from "./ProductView";

/* ================= SEO ================= */
export async function generateMetadata({ params }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${params.slug}`,
      { cache: "no-store" }
    );

    const data = await res.json();
    const p = data.product || {};

    return {
      title: p.name || "Product",
      description:
        p.shortDescription ||
        p.description ||
        "Buy premium natural products online",

      openGraph: {
        title: p.name,
        description: p.shortDescription,
        images: p.images?.[0] ? [p.images[0]] : [],
      },
    };
  } catch {
    return {
      title: "Product",
      description: "Buy online",
    };
  }
}

/* ================= PAGE ================= */
export default async function ProductPage({ params }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${params.slug}`,
    { cache: "no-store" }
  );

  const data = await res.json();

  const p = data.product;

  if (!p) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Product not found</h2>
      </div>
    );
  }

  const variants = data.variants || [];

  const currentVariant =
    variants.find((v) => v.slug === params.slug) ||
    variants[0] ||
    {};

  const mrp = currentVariant?.mrp || p.mrp || 0;
  const sellingPrice =
    currentVariant?.sellingPrice || p.sellingPrice || 0;

  const discount =
    mrp > 0
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  const stock = currentVariant?.stock ?? 0;

  const stockText =
    stock > 10
      ? "In Stock"
      : stock > 0
      ? `Only ${stock} left`
      : "Out of Stock";

  return (
    <>
      {/* 🔥 JSON-LD SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: p.name,
            image: p.images,
            description: p.description,
            sku: currentVariant?.sku,
            offers: {
              "@type": "Offer",
              price: sellingPrice,
              priceCurrency: "INR",
              availability:
                stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          }),
        }}
      />

      <ProductView
        p={p}
        variants={variants}
        currentVariant={currentVariant}
        discount={discount}
        stock={stock}
        stockText={stockText}
      />
    </>
  );
}
