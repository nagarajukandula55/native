import ProductsPageClient from "./ProductsPageClient";

export const metadata = {
  title: "Shop All Products | Native",
  description:
    "Browse Native's full catalogue of authentic, natural Indian food products — cold-pressed oils, millets, spices, snacks, ready-to-eat and more, sourced directly from farmers.",
  openGraph: {
    title: "Shop All Products | Native",
    description:
      "Browse Native's full catalogue of authentic, natural Indian food products sourced directly from farmers.",
    url: "https://shopnative.in/products",
    siteName: "Native",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop All Products | Native",
    description:
      "Browse Native's full catalogue of authentic, natural Indian food products.",
  },
  alternates: {
    canonical: "https://shopnative.in/products",
  },
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}
