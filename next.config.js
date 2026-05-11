/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  output: "standalone"
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
