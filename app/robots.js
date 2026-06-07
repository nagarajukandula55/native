// app/robots.js

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },

    sitemap: "https://shopnative.in/sitemap.xml",

    host: "https://shopnative.in",
  };
}
