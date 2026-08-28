// app/sitemap.js
//
// Next.js App Router treats sitemap.js as a metadata route handler — served
// per-request (not written into public/ like next-sitemap's postbuild
// output), so this is the "route handler" approach the SEO plan calls out
// as more automated than static build-time generation: `force-dynamic`
// below means every crawl of /sitemap.xml re-fetches live products and
// categories from ANgroup, so new/removed products show up without
// waiting on a rebuild/redeploy.

import { getProducts, getCategories } from "@/lib/an-sdk/products";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  let products = [];
  let categories = [];

  try {
    // getProducts({}) hits GET /api/storefront/products with no query —
    // the route paginates, but its default page size covers the current
    // catalogue; if the catalogue grows past one page this should switch
    // to looping `page` until the response comes back short.
    const data = await getProducts({ limit: 1000 });
    products = data?.products || (Array.isArray(data) ? data : []);
  } catch (err) {
    products = [];
  }

  try {
    const data = await getCategories();
    categories = data?.categories || [];
  } catch (err) {
    categories = [];
  }

  const productUrls = products
    .filter((product) => product?.slug)
    .map((product) => ({
      url: `https://shopnative.in/products/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

  const categoryUrls = categories
    .filter((cat) => cat?._id)
    .map((cat) => ({
      url: `https://shopnative.in/products?category=${encodeURIComponent(cat._id)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [
    {
      url: "https://shopnative.in",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: "https://shopnative.in/products",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    // /cart and /checkout deliberately excluded -- robots.js disallows
    // crawling both (transactional, no SEO value), so listing them here
    // would contradict robots.txt.
    {
      url: "https://shopnative.in/sell",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },

    {
      url: "https://shopnative.in/about",
      lastModified: new Date(),
      priority: 0.4,
    },

    {
      url: "https://shopnative.in/contact",
      lastModified: new Date(),
      priority: 0.4,
    },

    {
      url: "https://shopnative.in/privacy-policy",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },

    {
      url: "https://shopnative.in/terms-and-conditions",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },

    {
      url: "https://shopnative.in/refund-policy",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },

    {
      url: "https://shopnative.in/shipping-policy",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },

    ...categoryUrls,
    ...productUrls,
  ];
}
