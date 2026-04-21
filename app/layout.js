import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Cinzel, Poppins } from "next/font/google";
import Script from "next/script";

export const dynamic = "force-dynamic";

/* ================= FONTS ================= */
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-brand",
  display: "swap", // ✅ prevents font flicker
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap", // ✅ better UX
});

/* ================= META ================= */
export const metadata = {
  title: "Native | Eat Healthy Stay Healthy",
  description:
    "Authentic natural food products refined directly from the source",
};

/* ================= LAYOUT ================= */
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${poppins.variable}`}
      suppressHydrationWarning // ✅ prevents hydration mismatch errors
    >
      <body
        style={{
          margin: 0,
          background: "#faf8f3",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* ✅ Razorpay Script (safe load) */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />

        {/* 🔥 GLOBAL STATE */}
        <AuthProvider>
          <CartProvider>

            {/* NAVBAR */}
            <Navbar />

            {/* MAIN CONTENT */}
            <main
              style={{
                minHeight: "80vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {children}
            </main>

            {/* FOOTER */}
            <Footer />

          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
