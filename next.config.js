/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  serverExternalPackages: ["pdfkit"],

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
