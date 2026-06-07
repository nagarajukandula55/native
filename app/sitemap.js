// app/sitemap.js

export default function sitemap() {
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
  ];
}
