import ProductView from "./ProductView";

/* ================= SEO ================= */
export async function generateMetadata({ params }) {
  const res = await fetch(`https://shopnative.in/api/products/${params.slug}`, {
    cache: "no-store",
  });

  const data = await res.json();
  const p = data.product || {};

  return {
    title: p.name || "Product",
    description: p.shortDescription || "Buy online",
  };
}

/* ================= PAGE ================= */
export default async function ProductPage({ params }) {

  const res = await fetch(`https://shopnative.in/api/products/${params.slug}`, {
    cache: "no-store",
  });

  const data = await res.json();

  const p = data.product;
  const variants = data.variants || [];

  const currentVariant =
    variants.find(v => v.slug === params.slug) || p;

  const discount = currentVariant?.mrp
    ? Math.round(((currentVariant.mrp - currentVariant.sellingPrice) / currentVariant.mrp) * 100)
    : 0;

  const stock = currentVariant?.stock || 0;

  const stockText =
    stock > 10 ? "In Stock" :
    stock > 0 ? `Only ${stock} left` :
    "Out of Stock";

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
