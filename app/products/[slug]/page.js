import ProductClient from "./ProductClient";

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`https://shopnative.in/api/products/${params.slug}`, {
      cache: "no-store",
    });

    const data = await res.json();

    const product = data.product;

    return {
      title: product?.name || "Product",
      description: product?.shortDescription || "Buy now",
      openGraph: {
        title: product?.name,
        description: product?.shortDescription,
        images: product?.images || [],
      },
    };
  } catch (err) {
    return {
      title: "Product",
      description: "Product Page",
    };
  }
}

export default function Page({ params }) {
  return <ProductClient slug={params.slug} />;
}
