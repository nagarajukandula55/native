"use client";

import ProductView from "@/components/ProductView";

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }) {
  const slug = decodeURIComponent(params?.slug || "");

  if (!slug) {
    return (
      <div style={styles.errorWrap}>
        <h2>Invalid Product URL</h2>
      </div>
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://shopnative.in";

  let data;

  try {
    const res = await fetch(`${baseUrl}/api/products/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return (
        <div style={styles.errorWrap}>
          <h2>Product not found</h2>
          <p>Please check the URL or try again later.</p>
        </div>
      );
    }

    data = await res.json();
  } catch (err) {
    return (
      <div style={styles.errorWrap}>
        <h2>Something went wrong</h2>
        <p>Unable to load product details.</p>
      </div>
    );
  }

  const p = data?.product;

  if (!p) {
    return (
      <div style={styles.errorWrap}>
        <h2>Product not found</h2>
      </div>
    );
  }

  /* ================= VARIANTS ================= */
  const variants = (data?.variants || []).map((v) => ({
    ...v,
    variant:
      v.variant || `${v.value || ""}${v.unit || ""}` || "Default",
    images: v.images?.length ? v.images : p.images || [],
  }));

  const currentVariant = variants[0] || {};

  const mrp = currentVariant?.mrp ?? p?.mrp ?? 0;
  const sellingPrice =
    currentVariant?.sellingPrice ?? p?.sellingPrice ?? 0;

  const discount =
    mrp > 0
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  return (
    <div className="page">
      {/* HERO SECTION */}
      <div className="container">
        <ProductView
          p={p}
          variants={variants}
          currentVariant={currentVariant}
          discount={discount}
        />
      </div>

      {/* GLOBAL STYLES */}
      <style jsx>{`
        .page {
          background: #f7f7f8;
          min-height: 100vh;
          padding: 30px 15px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .container {
          max-width: 1200px;
          margin: auto;
          background: #fff;
          border-radius: 18px;
          padding: 25px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </div>
  );
}

/* ================= ERROR UI ================= */
const styles = {
  errorWrap: {
    padding: "40px",
    textAlign: "center",
    fontFamily: "system-ui",
  },
};
