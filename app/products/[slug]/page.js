import ProductView from "@/components/ProductView";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${params.slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return {
      title: "Product Not Found",
    };
  }

  let data = null;

try {
  data = await res.json();
} catch (err) {
  console.error("INVALID API RESPONSE");
  return <div>Server Error</div>;
}
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
}

export default async function ProductPage({ params }) {
  const slug = params?.slug;

  if (!slug) return notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const res = await fetch(`${baseUrl}/api/products/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) return notFound();

  const data = await res.json();
  const product = data?.product;

  if (!product) return notFound();

  const variants = (data?.variants || []).map((v) => ({
    ...v,
    variant: v.variant || `${v.value || ""}${v.unit || ""}` || "Default",
    images: v.images?.length ? v.images : product.images || [],
  }));

  return <ProductView product={product} variants={variants} />;
}
