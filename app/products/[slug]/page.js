import ProductView from "@/components/ProductView";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/an-sdk/products";

/* ================= METADATA ================= */
export async function generateMetadata({ params }) {
  try {
    const data = await getProductBySlug(params.slug);
    const p = data?.product;

    if (!p) {
      return { title: "Product Not Found | Native" };
    }

    // Real SEO fields from ANgroup (metaTitle/metaDescription/keywords) when
    // present, falling back to sensible values derived from the product
    // itself — see storefront/products/[slug]/route.ts, which already
    // falls back metaTitle -> name and metaDescription -> description
    // server-side, so `p.metaTitle`/`p.metaDescription` are effectively
    // always populated; the `||` chains here are just extra safety.
    const title = p?.metaTitle || p?.name || "Product | Native";
    const description =
      p?.metaDescription || p?.description || "Authentic natural food product from Native.";
    const url = `https://shopnative.in/products/${p?.slug || params.slug}`;
    const image = p?.images?.[0];

    return {
      title: `${title} | Native`,
      description,
      keywords: p?.keywords?.length ? p.keywords : undefined,
      openGraph: {
        title,
        description,
        url,
        siteName: "Native",
        images: image ? [image] : [],
        type: "website",
        locale: "en_IN",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : [],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch (err) {
    return {
      title: err?.status === 404 ? "Product Not Found | Native" : "Server Error | Native",
    };
  }
}

/* ================= PAGE ================= */
export default async function ProductPage({ params }) {
  const slug = params?.slug;

  if (!slug) return notFound();

  let data;

  try {
    data = await getProductBySlug(slug);
  } catch (err) {
    if (err?.status === 404) return notFound();

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

  // Real schema.org Product markup — only fields backed by actual data from
  // the API (name/image/description/price/stock). No aggregateRating since
  // ANgroup doesn't return review data on this endpoint yet.
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.metaDescription || product.description || undefined,
    image: product.images?.length ? product.images : undefined,
    sku: product.sku || undefined,
    offers: {
      "@type": "Offer",
      url: `https://shopnative.in/products/${product.slug}`,
      priceCurrency: "INR",
      price: product.price ?? 0,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductView product={product} variants={variants} />
    </>
  );
}
