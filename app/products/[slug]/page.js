import ProductView from "./ProductView";

/* ================= SEO ================= */
export async function generateMetadata({ params }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${params.slug}`,
      { cache: "no-store" }
    );

    const data = await res.json();
    const p = data?.product || {};

    return {
      title: p?.name || "Product",
      description:
        p?.shortDescription ||
        p?.description ||
        "Buy high quality products online",
      openGraph: {
        title: p?.name || "Product",
        description: p?.shortDescription || "",
        images: p?.images?.[0] ? [p.images[0]] : [],
      },
    };
  } catch (err) {
    return {
      title: "Product",
      description: "Buy online",
    };
  }
}

/* ================= PAGE ================= */
export default async function ProductPage({ params }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${params.slug}`,
      { cache: "no-store" }
    );

    const data = await res.json();

    const p = data?.product;

    if (!p) {
      return (
        <div style={{ padding: 20 }}>
          <h2>Product not found</h2>
        </div>
      );
    }

    const variants = data?.variants || [];

    /* ================= VARIANT FALLBACK ================= */
    const currentVariant =
      variants.find((v) => v.slug === params.slug) ||
      p.primaryVariant ||
      variants[0] ||
      {};

    /* ================= PRICE LOGIC ================= */
    const mrp =
      currentVariant?.mrp ??
      p?.pricing?.mrp ??
      p?.primaryVariant?.mrp ??
      0;

    const sellingPrice =
      currentVariant?.sellingPrice ??
      p?.pricing?.sellingPrice ??
      p?.primaryVariant?.sellingPrice ??
      0;

    const discount =
      mrp > 0
        ? Math.round(((mrp - sellingPrice) / mrp) * 100)
        : 0;

    /* ================= STOCK ================= */
    const stock =
      currentVariant?.stock ??
      p?.primaryVariant?.stock ??
      0;

    const stockText =
      stock > 10
        ? "In Stock"
        : stock > 0
        ? `Only ${stock} left`
        : "Out of Stock";

    /* ================= SAFE DESCRIPTION ================= */
    const description =
      p?.description ||
      p?.shortDescription ||
      "No description available";

    return (
      <ProductView
        p={{
          ...p,
          description, // 🔥 fix missing description issue
          mrp,
          sellingPrice,
        }}
        variants={variants}
        currentVariant={currentVariant}
        discount={discount}
        stock={stock}
        stockText={stockText}
      />
    );
  } catch (err) {
    console.error("SLUG PAGE ERROR:", err);

    return (
      <div style={{ padding: 20 }}>
        <h2>Something went wrong</h2>
      </div>
    );
  }
}
