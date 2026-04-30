import ProductView from "./ProductView";

export default async function ProductPage({ params }) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!params?.slug) {
    return <h2 style={{ padding: 20 }}>Invalid URL</h2>;
  }

  let data;

  try {
    const res = await fetch(
      `${baseUrl}/api/products/${params.slug}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Fetch failed");

    data = await res.json();
  } catch (err) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Something went wrong</h2>
        <p>Unable to load product details</p>
      </div>
    );
  }

  const p = data?.product;

  if (!p) {
    return <h2 style={{ padding: 20 }}>Product not found</h2>;
  }

  /* 🔥 NORMALIZE VARIANTS */
  const variants = (data?.variants || []).map((v) => ({
    ...v,
    variant: `${v.value}${v.unit}`, // 🔥 FIX
    images: p.images, // fallback
  }));

  const currentVariant = variants[0] || {};

  const mrp = currentVariant?.mrp ?? p?.mrp ?? 0;
  const sellingPrice =
    currentVariant?.sellingPrice ?? p?.sellingPrice ?? 0;

  const discount =
    mrp > 0
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  const stock = currentVariant?.stock ?? p?.stock ?? 0;

  const stockText =
    stock > 10
      ? "In Stock"
      : stock > 0
      ? `Only ${stock} left`
      : "Out of Stock";

  return (
    <ProductView
      p={p}
      variants={variants}
      currentVariant={currentVariant}
      discount={discount}
      stock={stock}
      stockText={stockText}
    />
  );
}
