import ProductView from "@/components/ProductView";
import { notFound } from "next/navigation";

/* ================= METADATA ================= */
export async function generateMetadata({ params }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${params.slug}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return {
        title: "Product Not Found",
      };
    }

    const data = await res.json();
    const p = data?.product;

    return {
      title: p?.name || "Product",
      description: p?.description || "",
      openGraph: {
        title: p?.name,
        description: p?.description,
        images: p?.images ? [p.images[0]] : [],
      },
    };
  } catch (err) {
    return {
      title: "Server Error",
    };
  }
}

/* ================= PAGE ================= */
export default async function ProductPage({ params }) {
  const slug = params?.slug;

  if (!slug) return notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  let data;

  try {
    const res = await fetch(
      `${baseUrl}/api/products/${slug}`,
      { cache: "no-store" }
    );

    if (!res.ok) return notFound();

    data = await res.json();
  } catch (err) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Server Error. Please try again later.
      </div>
    );
  }

  const product = data?.product;

  if (!product) return notFound();

  const variants = (data?.variants || []).map((v) => ({
    ...v,
    variant:
      v.variant || `${v.value || ""}${v.unit || ""}` || "Default",
    images: v.images?.length ? v.images : product.images || [],
  }));

  return (
    <ProductView
      product={product}
      variants={variants}
    />
  );
}
