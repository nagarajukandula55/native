import ProductView from "../ProductView";

/* ================= SEO ================= */
export async function generateMetadata({ params }) {
  try {
    const res = await fetch(
      `/api/products/${params.slug}`,
      { cache: "no-store" }
    );

    const data = await res.json();
    const p = data?.product || {};

    return {
      title: p?.name || "Product",
      description:
        p?.shortDescription ||
        p?.description ||
        "Buy online",
      openGraph: {
        title: p?.name,
        description: p?.shortDescription,
        images: p?.images?.[0] ? [p.images[0]] : [],
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
  try {
    const res = await fetch(
      `/api/products/${params.slug}`,
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

    const currentVariant =
      variants.find((v) => v.slug === params.slug) ||
      p.primaryVariant ||
      variants[0] ||
      {};

    const mrp =
      currentVariant?.mrp ??
      p?.pricing?.mrp ??
      0;

    const sellingPrice =
      currentVariant?.sellingPrice ??
      p?.pricing?.sellingPrice ??
      0;

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
      <ProductView
        p={{
          ...p,
          mrp,
          sellingPrice,
          description:
            p.description || p.shortDescription,
        }}
        variants={variants}
        currentVariant={currentVariant}
        discount={discount}
        stock={stock}
        stockText={stockText}
      />
    );
  } catch (err) {
    console.error("SLUG ERROR:", err);

    return (
      <div style={{ padding: 20 }}>
        <h2>Something went wrong</h2>
      </div>
    );
  }
}
