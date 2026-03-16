"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useCart } from "@/context/CartContext"
import Link from "next/link"

export default function Home() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Scrolling text - can later be fetched via admin API
  const [scrollText, setScrollText] = useState(
    "We are going to get new products to our Catalogue"
  )

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/admin/products")
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Categories - can be updated or added in admin later
  const categories = [
    "Batter Mix",
    "Cold Pressed Oils",
    "Traditional Foods",
    "Natural Products"
  ]

  return (
    <div>

      {/* HERO SECTION */}
      <section
        style={{
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 20px",
          background: "url('/hero.jpg') center/cover no-repeat",
          position: "relative",
          color: "#fff"
        }}
      >
        <div style={{ maxWidth: "800px", zIndex: 1 }}>
          <h1
            style={{
              fontSize: "clamp(48px,7vw,80px)",
              fontFamily: "Cinzel, serif",
              fontWeight: 600,
              marginBottom: "10px",
              textShadow: "2px 2px 10px rgba(0,0,0,0.4)"
            }}
          >
            Welcome to Native
          </h1>

          {/* SCROLLING MARQUEE */}
          <div style={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "8px",
            padding: "10px 0",
            margin: "20px 0",
            background: "rgba(0,0,0,0.3)"
          }}>
            <div
              style={{
                display: "inline-block",
                paddingLeft: "100%",
                animation: "scroll-left 15s linear infinite"
              }}
            >
              {scrollText}
            </div>
          </div>

          <p style={{ fontSize: "22px", marginBottom: "20px", textShadow: "1px 1px 6px rgba(0,0,0,0.3)" }}>
            Eat Healthy, Stay Healthy
          </p>
          <p style={{ fontSize: "18px", lineHeight: 1.8, marginBottom: "30px", textShadow: "1px 1px 5px rgba(0,0,0,0.3)" }}>
            Authentic natural food products refined directly from the source. Pure, traditional and healthy for everyday life.
          </p>
          <button
            onClick={() => document.getElementById("products").scrollIntoView({ behavior: "smooth" })}
            style={{
              padding: "14px 40px",
              borderRadius: "40px",
              border: "none",
              background: "#c28b45",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
            }}
          >
            Explore Products
          </button>
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section style={{ padding: "70px 20px", maxWidth: "1200px", margin: "auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "36px", marginBottom: "40px" }}>Our Categories</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "25px" }}>
          {categories.map((cat, i) => (
            <Link key={i} href={`/products?category=${encodeURIComponent(cat)}`}>
              <div style={categoryCard}>{cat}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section id="products" style={{ padding: "70px 20px", maxWidth: "1200px", margin: "auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "36px", marginBottom: "50px" }}>Featured Products</h2>
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading products...</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "30px" }}>
            {products.map((product) => (
              <div
                key={product._id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "12px",
                  padding: "20px",
                  textAlign: "center",
                  background: "#fff",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.05)"
                }}
              >
                <Link href={`/products/${product._id}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "8px", cursor: "pointer" }}
                  />
                </Link>
                <h3 style={{ marginTop: "15px" }}>{product.name}</h3>
                <p style={{ color: "#c28b45", fontSize: "18px", margin: "10px 0" }}>₹{product.price}</p>
                <button
                  onClick={() => {
                    addToCart(product)
                    window.dispatchEvent(new Event("cart-open"))
                  }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "25px",
                    border: "none",
                    background: "#c28b45",
                    color: "#fff",
                    cursor: "pointer"
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* WHY NATIVE */}
      <section style={{ background: "#f4efe6", padding: "70px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "36px", marginBottom: "40px" }}>Why Choose Native</h2>
        <div style={{ maxWidth: "1000px", margin: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "30px" }}>
          <div style={featureCard}>🌿 <br /> 100% Natural</div>
          <div style={featureCard}>🚜 <br /> Direct From Farmers</div>
          <div style={featureCard}>🧂 <br /> Traditional Methods</div>
          <div style={featureCard}>❤️ <br /> Healthy Lifestyle</div>
        </div>
      </section>

      {/* BLOG / ARTICLES PLACEHOLDER */}
      <section style={{ padding: "70px 20px", maxWidth: "1200px", margin: "auto" }}>
        <h2 style={{ fontSize: "36px", marginBottom: "40px", textAlign: "center" }}>Latest Articles</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "25px" }}>
          {[1,2,3].map((b) => (
            <div key={b} style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }}>
              <h3>Blog Title {b}</h3>
              <p>Short description of the article related to health or products.</p>
              <Link href="/blog" style={{ color: "#c28b45", fontWeight: "bold" }}>Read More</Link>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#3a2a1c", color: "#fff", padding: "40px 20px", marginTop: "50px" }}>
        <div style={{ maxWidth: "1200px", margin: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "20px" }}>
          <div>
            <h4>Native Foods</h4>
            <p>Authentic natural products</p>
            <p>FSSAI License: 20126021000129</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/products">Products</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/track">Track Order</Link></li>
            </ul>
          </div>
          <div>
            <h4>Follow Us</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li><a href="#" target="_blank">Facebook</a></li>
              <li><a href="#" target="_blank">Instagram</a></li>
              <li><a href="#" target="_blank">LinkedIn</a></li>
              <li><a href="#" target="_blank">YouTube</a></li>
            </ul>
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#ccc" }}>
          © {new Date().getFullYear()} Native Foods. All Rights Reserved.
        </p>
      </footer>

      {/* SCROLL LEFT ANIMATION */}
      <style jsx>{`
        @keyframes scroll-left {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  )
}

/* STYLES */
const categoryCard = {
  background: "#fff",
  padding: "40px 20px",
  borderRadius: "10px",
  fontSize: "18px",
  fontWeight: 500,
  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  cursor: "pointer",
  transition: "all 0.3s ease",
  textAlign: "center"
}
const featureCard = {
  background: "#fff",
  padding: "30px",
  borderRadius: "10px",
  fontSize: "18px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  textAlign: "center"
}
