// app/sitemap.js

import connectDB from "@/lib/db";
import Product from "@/models/Product";

export default async function sitemap() {
  await connectDB();

  const products = await Product.find({
    isActive: true,
    isListed: true,
  }).lean();

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

    ...productUrls,
  ];
}
