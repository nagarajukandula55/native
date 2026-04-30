"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function ProductsPage() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ================= ADD TO CART ================= */
  function handleAddToCart(p) {
    try {
      setAddingId(p._id);

      const item = {
        _id: p._id, // 🔥 MUST BE MongoDB ID
        productKey: p.productKey,
        name: p.name,
        price: p.displayPrice || 0,
        mrp: p.mrp || 0,
        image: p.images?.[0] || "/no-image.png",
        variant: "default",
        qty: 1,
      };

      console.log("ADD TO CART:", item);

      // ✅ ONLY LOCAL CART UPDATE
      addToCart(item);

    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setAddingId(null);
    }
  }

  /* ================= UI ================= */
  if (loading) {
    return <div className="container"><h1>Loading...</h1></div>;
  }

  return (
    <div className="container">
      <h1>All Products</h1>

      <div className="grid">
        {products.map((p) => {
          const price = p.displayPrice || 0;
          const mrp = p.mrp || 0;

          const discount =
            mrp && price
              ? Math.round(((mrp - price) / mrp) * 100)
              : 0;

          return (
            <div key={p._id} className="card">

              <Link href={`/products/${p.slug}`} className="link">
                <img src={p.images?.[0] || "/no-image.png"} />

                <h3>{p.name}</h3>

                <p>₹{price}</p>

                {discount > 0 && <span>{discount}% OFF</span>}
              </Link>

              <button
                onClick={() => handleAddToCart(p)}
                disabled={addingId === p._id}
              >
                {addingId === p._id ? "Adding..." : "Add to Cart"}
              </button>

            </div>
          );
        })}
      </div>
    </div>
  );
}
