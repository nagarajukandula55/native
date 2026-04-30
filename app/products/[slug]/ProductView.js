"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function ProductView({
  p,
  variants = [],
  currentVariant = {},
  discount = 0,
  stock = 0,
  stockText = "",
}) {
  const { addToCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState(currentVariant);
  const [selectedImage, setSelectedImage] = useState(
    currentVariant?.images?.[0] || p.images?.[0] || "/no-image.png"
  );

  const [toast, setToast] = useState("");

  useEffect(() => {
    setSelectedImage(
      selectedVariant?.images?.[0] ||
      p.images?.[0] ||
      "/no-image.png"
    );
  }, [selectedVariant, p.images]);

  const price = selectedVariant?.sellingPrice || p?.sellingPrice || 0;
  const mrp = selectedVariant?.mrp || p?.mrp || 0;

  const finalDiscount =
    mrp > 0
      ? Math.round(((mrp - price) / mrp) * 100)
      : discount;

  const availableStock = selectedVariant?.stock ?? stock ?? 0;

  function handleAddToCart() {
    addToCart({
      id: p._id,
      name: p.name,
      price,
      image: selectedImage,
      variant: selectedVariant?.variant,
    });

    setToast("Added to cart");
    setTimeout(() => setToast(""), 2000);
  }

  return (
    <div className="wrap">

      {/* LEFT */}
      <div className="left">
        <img src={selectedImage} className="mainImg" />

        <div className="thumbs">
          {(selectedVariant?.images || p.images || []).map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setSelectedImage(img)}
              className={selectedImage === img ? "active" : ""}
            />
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="right">
        <h1>{p.name}</h1>

        <div className="priceBox">
          <span className="price">₹{price}</span>

          {mrp > price && (
            <>
              <span className="mrp">₹{mrp}</span>
              <span className="off">{finalDiscount}% OFF</span>
            </>
          )}
        </div>

        <div className={`stock ${availableStock === 0 ? "out" : ""}`}>
          {stockText}
        </div>

        {/* VARIANTS */}
        {variants.length > 1 && (
          <div className="variants">
            {variants.map((v) => (
              <button
                key={v._id}
                onClick={() => setSelectedVariant(v)}
                className={
                  selectedVariant?._id === v._id ? "active" : ""
                }
              >
                {v.variant}
              </button>
            ))}
          </div>
        )}

        <button
          className="cartBtn"
          disabled={availableStock === 0}
          onClick={handleAddToCart}
        >
          {availableStock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>

        {/* DESCRIPTION */}
        <div className="section">
          <h3>Description</h3>
          <p>{p.description || p.shortDescription}</p>
        </div>

        {/* INGREDIENTS */}
        {p.ingredients?.length > 0 && (
          <div className="section">
            <h3>Ingredients</h3>
            <ul>
              {p.ingredients.map((i, idx) => (
                <li key={idx}>
                  {i.name} - {i.qty}{i.unit}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}

      <style jsx>{`
        .wrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          max-width: 1100px;
          margin: auto;
          padding: 20px;
        }

        .mainImg {
          width: 100%;
          height: 350px;
          object-fit: cover;
          border-radius: 10px;
        }

        .thumbs {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .thumbs img {
          width: 70px;
          height: 70px;
          cursor: pointer;
        }

        .price {
          font-size: 24px;
          font-weight: bold;
        }

        .mrp {
          text-decoration: line-through;
          color: #888;
          margin-left: 8px;
        }

        .off {
          color: green;
          margin-left: 8px;
        }

        .cartBtn {
          margin-top: 20px;
          padding: 12px;
          width: 100%;
          background: black;
          color: white;
          border: none;
        }

        .toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: black;
          color: white;
          padding: 10px;
        }
      `}</style>
    </div>
  );
}
