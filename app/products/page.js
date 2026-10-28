import ProductsPageClient from "./ProductsPageClient";
import { getProducts, getCategories } from "@/lib/an-sdk/products";

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

const PAGE_SIZE = 24;

/**
 * Every filter this listing supports (search/category/sort/min-max price/
 * vendor/page) lives in the URL's query string -- unlike the vertical
 * pages' pincode, none of it is client-only state, so the server CAN fetch
 * the first page of results ahead of time. Next.js re-runs this server
 * component on every navigation that changes the query string (the client
 * filters/pagination all go through router.push on this same route), so
 * every filter/sort/page change gets a fresh server-fetched result, not
 * just the first load.
 *
 * ProductsPageClient still does its own client-side fetch on top of this
 * (keyed by the exact same params, via the `initialKey` below) -- that's
 * what makes in-page interactions like Add to Cart/Share work without a
 * full page reload, and it's guarded to skip the redundant first fetch
 * when its initial props already match.
 */
export default async function ProductsPage({ searchParams }) {
  const search = searchParams?.search || "";
  const category = searchParams?.category || "";
  const sort = searchParams?.sort || "";
  const minPrice = searchParams?.minPrice || "";
  const maxPrice = searchParams?.maxPrice || "";
  const vendor = searchParams?.vendor || "";
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10));

  let initialProducts = [];
  let initialTotalPages = 1;
  let initialCategoryName = "";

  try {
    const data = await getProducts({
      search,
      category,
      sort,
      minPrice,
      maxPrice,
      vendor,
      page,
      limit: PAGE_SIZE,
    });
    initialProducts = data?.products || [];
    initialTotalPages = data?.totalPages || 1;
  } catch {
    // Falls through to ProductsPageClient's own client-side fetch, same as
    // any other failure path already handled there.
  }

  if (category) {
    try {
      const data = await getCategories();
      const match = (data?.categories || []).find((c) => (c.id || c._id) === category);
      initialCategoryName = match?.name || "";
    } catch {
      /* ignore -- ProductsPageClient resolves this client-side too */
    }
  }

  return (
    <ProductsPageClient
      initialProducts={initialProducts}
      initialTotalPages={initialTotalPages}
      initialCategoryName={initialCategoryName}
      initialKey={JSON.stringify({ search, category, sort, minPrice, maxPrice, vendor, page })}
    />
  );
}
