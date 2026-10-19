/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,


  images: {
    // Product/category/banner image URLs come back from the AN Group
    // backend (NEXT_PUBLIC_AN_API -- angroup.in in production, localhost
    // in dev), but the actual files are hosted on Cloudinary (confirmed
    // from a live product's image URL: res.cloudinary.com/<cloud-name>/...)
    // -- that's the host next/image actually needs to be allowed to
    // optimize from. Both are listed so this keeps working if the backend
    // ever serves images directly instead.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "www.angroup.in" },
      { protocol: "https", hostname: "angroup.in" },
      { protocol: "http", hostname: "localhost" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    // Vercel's file-tracing doesn't reliably pick up a dynamic
    // fs.readFileSync(path.join(process.cwd(), ...)) call the way it does
    // a static import -- without this, pincodes.csv (lib/pincodeState.ts,
    // used by the pincode->state->language lookup) would be missing from
    // the deployed serverless function and every lookup would silently
    // return null. Nested under `experimental` -- this Next.js version
    // (14.2.3) doesn't recognize it at the top level.
    outputFileTracingIncludes: {
      "/api/pincode-state/[pincode]": ["./pincodes.csv"],
    },
  },

  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
