/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",

  serverExternalPackages: ["pdfkit"],

  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
