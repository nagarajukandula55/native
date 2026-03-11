import Navbar from "@/components/Navbar"
import { CartProvider } from "@/context/CartContext"

export const metadata = {
  title: "Native - Eat Healthy Stay Healthy",
  description: "Authentic Indian products refined from the source",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>

        <CartProvider>

          <Navbar />

          <main>
            {children}
          </main>

        </CartProvider>

      </body>
    </html>
  )
}
