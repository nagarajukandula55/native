import HomeClient from "./HomeClient";
import { getProducts } from "@/lib/an-sdk/products";
import { getBanners } from "@/lib/an-sdk/banners";
import { getRecentReviews } from "@/lib/an-sdk/reviews";

export const metadata = {
  title: "Native | Eat Healthy Stay Healthy",
  description:
    "Shop authentic, natural food products sourced directly from farmers across India — cold-pressed oils, millets, spices, snacks and more. FSSAI certified, no preservatives.",
  openGraph: {
    title: "Native | Eat Healthy Stay Healthy",
    description:
      "Authentic natural food products refined directly from the source. FSSAI certified, sourced directly from Indian farmers.",
    url: "https://shopnative.in",
    siteName: "Native",
    images: ["https://shopnative.in/hero.png"],
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Native | Eat Healthy Stay Healthy",
    description:
      "Authentic natural food products refined directly from the source.",
    images: ["https://shopnative.in/hero.png"],
  },
  alternates: {
    canonical: "https://shopnative.in",
  },
};

// Best sellers, featured products, reviews and banners are all public,
// pincode/auth-independent data -- fetching them here (server-side, in
// parallel) means the homepage ships with real content already in the
// initial HTML instead of 4 separate client round trips + loading states
// after hydration. Category tiles stay client-fetched in HomeClient: that
// listing is filtered by the customer's delivery pincode, which lives in
// localStorage and can change post-hydration (see lib/pincode.ts) -- there
// is no server-side way to know it on first render.
//
// Promise.allSettled (not Promise.all) so one failing call can't take the
// others down with it -- each case below mirrors the empty-array/null
// fallback the client-side useEffect it replaces used to fall back to.
export default async function Home() {
  const [bestSellersResult, featuredResult, reviewsResult, bannersResult] =
    await Promise.allSettled([
      getProducts({ bestSeller: true, limit: 6 }),
      getProducts({ featured: true, limit: 8 }),
      getRecentReviews(6),
      getBanners(),
    ]);

  const initialProducts =
    bestSellersResult.status === "fulfilled" ? bestSellersResult.value?.products || [] : [];
  const initialFeaturedProducts =
    featuredResult.status === "fulfilled" ? featuredResult.value?.products || [] : [];
  const initialReviews =
    reviewsResult.status === "fulfilled" ? reviewsResult.value?.reviews || [] : [];
  const initialBanners =
    bannersResult.status === "fulfilled" && bannersResult.value?.success
      ? bannersResult.value.banners || []
      : [];

  return (
    <HomeClient
      initialProducts={initialProducts}
      initialFeaturedProducts={initialFeaturedProducts}
      initialReviews={initialReviews}
      initialBanners={initialBanners}
    />
  );
}
