// app/robots.js

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private/transactional/account routes — no SEO value, shouldn't
      // show up in search results.
      disallow: ["/admin", "/checkout", "/profile", "/cart", "/orders", "/api"],
    },

    sitemap: "https://shopnative.in/sitemap.xml",

    host: "https://shopnative.in",
  };
}
