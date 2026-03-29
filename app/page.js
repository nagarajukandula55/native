"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useCart } from "@/context/CartContext"

export default function Home() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products") // ✅ Public API
        const data = await res.json()
        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          console.warn("Invalid product data:", data)
          setProducts([])
        }
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div>

      {/* HERO SECTION */}
      <section
        style={{
          position: "relative",
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 20px",
          background: "url('/hero.png') center/cover no-repeat",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 1
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 20,
            width: "100%",
            zIndex: 2,
            overflow: "hidden",
            whiteSpace: "nowrap"
          }}
        >
          <div
            style={{
              display: "inline-block",
              paddingLeft: "100%",
              animation: "scroll-left 15s linear infinite",
              color: "#fff",
              fontWeight: "500",
              fontSize: "18px"
            }}
          >
            We are going to get new products to our Catalogue
          </div>
        </div>

        <div style={{ maxWidth: "800px", position: "relative", zIndex: 2, color: "#fff" }}>
          <h1
            style={{
              fontSize: "clamp(48px,7vw,80px)",
              color: "#fff",
              marginBottom: "10px",
              fontFamily: "Cinzel, serif",
              fontWeight: "600"
            }}
          >
            Welcome to Native
          </h1>
          <p style={{ fontSize: "22px", marginBottom: "20px", color: "#fff" }}>
            Eat Healthy, Stay Healthy
          </p>
          <p style={{ fontSize: "18px", lineHeight: "1.8", marginBottom: "30px", color: "#fff" }}>
            Authentic natural food products refined directly from the source. Pure, traditional and healthy for everyday life.
          </p>
          <button
            onClick={() =>
              document
                .getElementById("products")
                .scrollIntoView({ behavior: "smooth" })
            }
            style={{
              padding: "14px 40px",
              borderRadius: "40px",
              border: "none",
              background: "#c28b45",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            Explore Products
          </button>
        </div>

        <style>{`
          @keyframes scroll-left {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </section>

      {/* CATEGORY SECTION */}
      <section style={{ padding: "70px 20px", maxWidth: "1200px", margin: "auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "36px", marginBottom: "40px" }}>Our Categories</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "25px" }}>
          <div style={categoryCard}>Batter Mix</div>
          <div style={categoryCard}>Cold Pressed Oils</div>
          <div style={categoryCard}>Traditional Foods</div>
          <div style={categoryCard}>Natural Products</div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section id="products" style={{ padding: "70px 20px", maxWidth: "1200px", margin: "auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "36px", marginBottom: "50px" }}>Featured Products</h2>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading products...</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "30px" }}>
            {products.length === 0 ? (
              <p style={{ textAlign: "center" }}>No products available</p>
            ) : (
              products.map((product) => (
                <div key={product._id} style={productCard}>
                  <img src={product.image} alt={product.name} style={productImage} />
                  <h3 style={{ marginTop: "15px" }}>{product.name}</h3>
                  <p style={{ color: "#c28b45", fontSize: "18px", margin: "10px 0" }}>₹{product.price}</p>
                  <button
                    onClick={() => { addToCart(product); window.dispatchEvent(new Event("cart-open")) }}
                    style={cartButton}
                  >
                    Add to Cart
                  </button>
                </div>
              ))
            )}
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

    </div>
  )
}

/* STYLES */
const categoryCard = {
  background: "#fff",
  padding: "40px 20px",
  borderRadius: "10px",
  fontSize: "18px",
  fontWeight: "500",
  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  cursor: "pointer"
}

const productCard = {
  border: "1px solid #eee",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center",
  background: "#fff",
  boxShadow: "0 5px 15px rgba(0,0,0,0.05)"
}

const productImage = {
  width: "100%",
  height: "220px",
  objectFit: "cover",
  borderRadius: "8px"
}

const cartButton = {
  padding: "10px 20px",
  borderRadius: "25px",
  border: "none",
  background: "#c28b45",
  color: "#fff",
  cursor: "pointer"
}

const featureCard = {
  background: "#fff",
  padding: "30px",
  borderRadius: "10px",
  fontSize: "18px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.05)"
}
