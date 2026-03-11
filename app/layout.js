
import { CartProvider } from "@/context/CartContext"
import Navbar from "@/components/Navbar"

export const metadata = {
  title: "Native | Authentic Indian Products",
  description: "Premium Indian traditional products.",
}

export default function RootLayout({ children }) {

  return (
    <html lang="en">

      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body
        style={{
          margin: 0,
          fontFamily: "'Georgia', serif",
          backgroundColor: "#fffdf9",
          color: "#3a2a1c",
        }}
      >

        <CartProvider>

          <Navbar />

          <main
            style={{
              minHeight: "80vh",
              padding: "60px 80px",
              maxWidth: "1400px",
              margin: "0 auto"
            }}
          >
            {children}
          </main>

          <footer
            style={{
              backgroundColor: "#f4efe6",
              textAlign: "center",
              padding: "30px",
              fontSize: "14px",
              borderTop: "1px solid #e5dccf",
              marginTop: "40px"
            }}
          >
            © {new Date().getFullYear()} Native. All Rights Reserved.
          </footer>

        </CartProvider>

      </body>

    </html>
  )
}

