// app/sitemap.js

import { getProducts } from "@/lib/an-sdk/products";

export default async function sitemap() {
  let products = [];

  try {
    const data = await getProducts({});
    products = data?.products || (Array.isArray(data) ? data : []);
  } catch (err) {
    products = [];
  }

  const productUrls = products.map((product) => ({
    url: `https://shopnative.in/products/${product.slug}`,
    lastModified: product.updatedAt || new Date(),
    changeFrequency: "daily",
    priority: 0.8,
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

    {
      url: "https://shopnative.in/cart",
      lastModified: new Date(),
      priority: 0.5,
    },

    {
      url: "https://shopnative.in/checkout",
      lastModified: new Date(),
      priority: 0.5,
    },

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

    ...productUrls,
  ];
}
