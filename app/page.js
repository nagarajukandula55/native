"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products", {
          cache: "no-store",
        });

        const data = await res.json();

        const list = data?.products || [];

        setProducts(list);
      } catch (err) {
        console.error("Product fetch error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <div className="home">

      {/* HERO */}
      <section className="hero">
        <div className="overlay" />

        <div className="heroContent">
          <h1>Welcome to Native</h1>
          <p className="tagline">Eat Healthy, Stay Healthy</p>

          <button
            onClick={() =>
              document.getElementById("products").scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            Explore Products
          </button>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="section">
        <h2>Featured Products</h2>

        {loading ? (
          <p>Loading...</p>
        ) : products.length === 0 ? (
          <p>No products found</p>
        ) : (
          <div className="grid">
            {products.map((p) => {
              const price = p.displayPrice || p.minPrice || 0;
              const mrp = p.mrp || 0;

              const discount =
                mrp > 0
                  ? Math.round(((mrp - price) / mrp) * 100)
                  : 0;

              return (
                <div key={p._id} className="card">

                  {/* IMAGE */}
                  <img
                    src={p.images?.[0] || "/placeholder.png"}
                    alt={p.name}
                  />

                  {/* NAME */}
                  <h3>{p.name}</h3>

                  {/* DESCRIPTION */}
                  <p className="desc">
                    {p.shortDescription ||
                      p.description ||
                      "No description available"}
                  </p>

                  {/* PRICE */}
                  <div className="priceBox">
                    <span className="price">₹{price}</span>

                    {mrp > price && (
                      <>
                        <span className="mrp">₹{mrp}</span>
                        <span className="off">{discount}% OFF</span>
                      </>
                    )}
                  </div>

                  {/* ADD TO CART */}
                  <button
                    onClick={() =>
                      addToCart({
                        id: p._id,
                        name: p.name,
                        price,
                        image: p.images?.[0],
                      })
                    }
                  >
                    Add to Cart
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* STYLES */}
      <style jsx>{`
        .section {
          padding: 50px 20px;
          max-width: 1200px;
          margin: auto;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .card {
          background: white;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }

        img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 8px;
        }

        h3 {
          margin: 10px 0 5px;
        }

        .desc {
          font-size: 13px;
          color: #666;
          height: 40px;
          overflow: hidden;
        }

        .priceBox {
          margin: 10px 0;
        }

        .price {
          font-weight: bold;
          font-size: 18px;
        }

        .mrp {
          text-decoration: line-through;
          margin-left: 8px;
          color: #999;
        }

        .off {
          color: green;
          margin-left: 8px;
        }

        button {
          width: 100%;
          padding: 10px;
          background: black;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
