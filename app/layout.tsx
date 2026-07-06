import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { UserProvider } from "@/context/UserContext";
import CookieConsent from "@/components/CookieConsent";
import { Toaster } from "react-hot-toast";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
import type { Metadata } from "next";

/* ================= FONTS ================= */

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

/* ================= META (KEEPING YOUR TAGLINE UNCHANGED) ================= */

export const metadata: Metadata = {
  title: "Native | Eat Healthy Stay Healthy",
  description: "Authentic natural food products refined directly from the source",
};

/* ================= ROOT LAYOUT ================= */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <head>
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

              <Navbar />

              <main className="app-main">{children}</main>

              <Footer />
              <CookieConsent />
            </WishlistProvider>
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
