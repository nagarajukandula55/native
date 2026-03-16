"use client" // Ensure client context is available for cart

import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { CartProvider } from "@/context/CartContext"
import { Cinzel, Poppins } from "next/font/google"

export const dynamic = "force-dynamic"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-brand"
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body"
})

export const metadata = {
  title: "Native | Eat Healthy Stay Healthy",
  description:
    "Authentic natural food products refined directly from the source"
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${poppins.variable}`}>
      <body
        style={{
          margin: 0,
          background: "#faf8f3",
          fontFamily: "var(--font-body)"
        }}
      >
        {/* ✅ Wrap entire app with CartProvider so context is available */}
        <CartProvider>
          {/* Navbar must be client component using useCart */}
          <Navbar />

          <main style={{ minHeight: "80vh" }}>
            {children}
          </main>

          {/* Footer must be client component */}
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
