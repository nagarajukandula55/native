"use client";

import { useCart } from "./context/CartContext";

const sampleProducts = [
  {
    id: "p1",
    name: "Handmade Indian Basket",
    price: 499,
    image: "/products/basket.jpg",
  },
  {
    id: "p2",
    name: "Traditional Clay Pot",
    price: 299,
    image: "/products/clay-pot.jpg",
  },
  {
    id: "p3",
    name: "Premium Scented Incense",
    price: 199,
    image: "/products/incense.jpg",
  },
];

export default function Home() {
  const { addToCart } = useCart();

  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "'Georgia', serif",
        backgroundColor: "#f4efe6",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1603046891744-7610fdb6fb3d')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(244, 239, 230, 0.92)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Hero Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          textAlign: "center",
          paddingTop: "140px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "70px",
            marginBottom: "25px",
            fontWeight: "normal",
            color: "#3a2a1c",
          }}
        >
          Welcome to Native
        </h1>

        <p
          style={{
            fontSize: "22px",
            lineHeight: "1.8",
            marginBottom: "50px",
            color: "#5c4634",
          }}
        >
          Eat Healthy, Stay Healthy.  
          Authentic Indian products refined from the source —
          crafted with purity, tradition and trust.
        </p>

        <button
          onClick={() =>
            document
              .getElementById("product-section")
              .scrollIntoView({ behavior: "smooth" })
          }
          style={{
            padding: "16px 55px",
            fontSize: "18px",
            borderRadius: "50px",
            border: "2px solid #c28b45",
            backgroundColor: "#c28b45",
            color: "#fff",
            cursor: "pointer",
            letterSpacing: "1px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          }}
        >
          Explore Products
        </button>
      </div>

      {/* Product Listing Section */}
      <section
        id="product-section"
        style={{
          position: "relative",
          zIndex: 2,
          padding: "80px 60px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ fontSize: "36px", marginBottom: "40px", textAlign: "center" }}>
          Our Products
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "30px",
          }}
        >
          {sampleProducts.map((product) => (
            <div
              key={product.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                textAlign: "center",
                backgroundColor: "#fff",
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  marginBottom: "15px",
                }}
              />
              <h3 style={{ marginBottom: "10px" }}>{product.name}</h3>
              <p style={{ fontWeight: "bold", marginBottom: "15px" }}>₹{product.price}</p>
              <button
                onClick={() => addToCart(product)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "25px",
                  border: "none",
                  backgroundColor: "#c28b45",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
