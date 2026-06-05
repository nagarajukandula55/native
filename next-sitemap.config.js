/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://shopnative.in",
  generateRobotsTxt: false,
  sitemapSize: 7000,
  changefreq: "daily",
  priority: 0.7,
  exclude: ["/admin", "/api", "/cart", "/checkout"],
};
