import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your Store - Best Online Shopping",
  description: "Shop quality products at best prices with fast delivery.",
  keywords: ["ecommerce", "shopping", "online store"],
  metadataBase: new URL("https://yourdomain.com"),
  openGraph: {
    title: "Your Store",
    description: "Best online shopping experience",
    url: "https://yourdomain.com",
    siteName: "Your Store",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>

        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-XXXXXXX');
              gtag('config', 'AW-XXXXXXX'); // Google Ads ID
            `,
          }}
        />

      </head>

      <body>{children}</body>
    </html>
  );
}

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

/* ================= META ================= */

export const metadata = {
  title: "Native | Eat Healthy Stay Healthy",
  description:
    "Authentic natural food products refined directly from the source",
};

/* ================= ROOT LAYOUT ================= */

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body className="app-body">
        {/* Razorpay Script */}
        <Script
          id="razorpay-checkout"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />

        <CartProvider>
          <Navbar />

          <main className="app-main">
            {children}
          </main>

          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
