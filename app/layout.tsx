import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { UserProvider } from "@/context/UserContext";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppButton from "@/components/WhatsAppButton";
import ChatWidget from "@/components/ChatWidget";
import InstallAppButton from "@/components/InstallAppButton";
import { Toaster } from "react-hot-toast";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Script from "next/script";
import type { Metadata } from "next";
import { getBusinessBranding } from "@/lib/an-sdk/company";

/* ================= FONTS =================
   Fraunces read as too "quirky/odd" for the owner's taste (its distinctive
   optical-size personality is polarizing). Swapped to a safer, still-premium
   pairing: Playfair Display (a classic, elegant, widely-used editorial serif
   for headings — far more conventional than Fraunces while still feeling
   upscale) with DM Sans (a clean, neutral, highly-legible geometric sans for
   body copy, prices, forms, and UI chrome). Both load via next/font/google
   with display: swap and CSS variables consumed globally in globals.css
   (--font-heading / --font-body), same wiring as before. */

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

/* ================= META (KEEPING YOUR TAGLINE UNCHANGED) ================= */

export const viewport = {
  themeColor: "#1f3d2b",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://shopnative.in"),
  title: "Native | Eat Healthy Stay Healthy",
  description: "Authentic natural food products refined directly from the source",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Native",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Native | Eat Healthy Stay Healthy",
    description: "Authentic natural food products refined directly from the source",
    siteName: "Native",
    url: "https://shopnative.in",
    type: "website",
    locale: "en_IN",
    images: ["/brand/native_logo_1024.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Native | Eat Healthy Stay Healthy",
    description: "Authentic natural food products refined directly from the source",
    images: ["/brand/native_logo_1024.png"],
  },
  other: {
    // GEO / local-relevance tags — Native is an India-focused storefront
    // (GST/pincode/INR throughout). ANgroup's public branding endpoint
    // (GET /api/businesses/public) doesn't expose a city/state, so we
    // don't fabricate a specific address here — just the country-level
    // signal that's actually backed by the business's real context.
    "geo.region": "IN",
    "geo.placename": "India",
  },
};

/* ================= ROOT LAYOUT ================= */

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Business-admin-configurable branding (ANgroup's Business.logo, exposed
  // publicly via GET /api/businesses/public — see lib/an-sdk/company.ts).
  // Falls back to the static /favicon.ico + Navbar's static logo asset
  // whenever this returns null (no businessId set, network error, or the
  // business simply hasn't uploaded a logo yet) — branding never blocks
  // the site from rendering.
  const branding = await getBusinessBranding().catch(() => null);

  // Organization schema — only fields backed by real data (branding name/
  // logo from ANgroup's public business endpoint); no fabricated address,
  // phone, or social profiles since none of that is exposed there.
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: branding?.name || "Native",
    url: "https://shopnative.in",
    ...(branding?.logo ? { logo: branding.logo } : {}),
  };

  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/brand/native_logo_256.png" />
        {branding?.logo && (
          <link rel="icon" href={branding.logo} />
        )}
        {branding?.favicon && (
          <link rel="icon" href={branding.favicon} sizes="any" />
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />

        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXX"}`}
          strategy="afterInteractive"
        />

        <Script id="ga-script" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXX"}');
            gtag('config', '${process.env.NEXT_PUBLIC_ADS_ID || "AW-XXXXXXX"}');
          `}
        </Script>

        {/* Razorpay Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </head>

      <body>
        <UserProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

              <Navbar {...({ logoUrl: branding?.logo || null } as any)} />

              <main className="app-main">{children}</main>

              <Footer />
              <WhatsAppButton />
              <ChatWidget />
              <InstallAppButton />
              <CookieConsent />
            </WishlistProvider>
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
