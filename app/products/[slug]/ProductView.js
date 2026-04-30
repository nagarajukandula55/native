"use client";

import { useState, useEffect } from "react";

export default function ProductView({
  p,
  variants = [],
  currentVariant = {},
  discount = 0,
  stock = 0,
  stockText = "",
}) {
  const [selectedVariant, setSelectedVariant] = useState(currentVariant);
  const [selectedImage, setSelectedImage] = useState(
    currentVariant?.images?.[0] || p.images?.[0] || "/no-image.png"
  );

  /* 🔥 Update image when variant changes */
  useEffect(() => {
    setSelectedImage(
      selectedVariant?.images?.[0] ||
      p.images?.[0] ||
      "/no-image.png"
    );
  }, [selectedVariant, p.images]);

  /* ================= PRICE ================= */
  const price =
    selectedVariant?.sellingPrice ??
    p?.sellingPrice ??
    0;

  const mrp =
    selectedVariant?.mrp ??
    p?.mrp ??
    0;

  const finalDiscount =
    mrp > 0
      ? Math.round(((mrp - price) / mrp) * 100)
      : discount;

  /* ================= STOCK ================= */
  const availableStock =
    selectedVariant?.stock ??
    stock ??
    0;

  /* ================= ADD TO CART ================= */
  async function addToCart() {
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: p._id,
          productKey: p.productKey,
          name: p.name,
          price,
          image: selectedImage,
          variant: selectedVariant?.variant,
          qty: 1,
        }),
      });

      alert("Added to cart");
    } catch (err) {
      console.error("Cart error:", err);
    }
  }

  return (
    <div className="wrap">

      {/* ================= LEFT ================= */}
      <div className="left">

        <img
          src={selectedImage}
          alt={p.name}
          className="mainImg"
        />

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

      {/* ================= RIGHT ================= */}
      <div className="right">

        <h1>{p.name}</h1>

        {/* PRICE */}
        <div className="priceBox">
          <span className="price">₹{price}</span>

          {mrp > price && (
            <>
              <span className="mrp">₹{mrp}</span>
              <span className="off">{finalDiscount}% OFF</span>
            </>
          )}
        </div>

        {/* STOCK */}
        <div className={`stock ${availableStock === 0 ? "out" : ""}`}>
          {availableStock > 10
            ? "In Stock"
            : availableStock > 0
            ? `Only ${availableStock} left`
            : "Out of Stock"}
        </div>

        {/* VARIANTS */}
        {variants.length > 1 && (
          <div className="variants">
            <h4>Select Variant</h4>

            <div className="variantList">
              {variants.map((v) => (
                <button
                  key={v._id}
                  onClick={() => setSelectedVariant(v)}
                  className={
                    selectedVariant?._id === v._id ? "active" : ""
                  }
                >
                  {v.variant || `${v.variantValue} ${v.variantUnit}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ADD TO CART */}
        <button
          className="cartBtn"
          disabled={availableStock === 0}
          onClick={addToCart}
        >
          {availableStock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>

        {/* DESCRIPTION */}
        <div className="section">
          <h3>Description</h3>
          <p>
            {p.description ||
              p.shortDescription ||
              "No description available"}
          </p>
        </div>

        {/* INGREDIENTS */}
        {p.ingredients?.length > 0 && (
          <div className="section">
            <h3>Ingredients</h3>
            <ul>
              {p.ingredients.map((ing, i) => (
                <li key={i}>
                  {ing.name} - {ing.qty}
                  {ing.unit}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .wrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          max-width: 1100px;
          margin: auto;
          padding: 20px;
        }

        .left {
          display: flex;
          flex-direction: column;
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
          object-fit: cover;
          cursor: pointer;
          border-radius: 6px;
          border: 2px solid transparent;
        }

        .thumbs img.active {
          border-color: black;
        }

        .right h1 {
          margin-bottom: 10px;
        }

        .priceBox {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 10px 0;
        }

        .price {
          font-size: 24px;
          font-weight: bold;
        }

        .mrp {
          text-decoration: line-through;
          color: #888;
        }

        .off {
          color: green;
          font-weight: bold;
        }

        .stock {
          margin: 10px 0;
          font-weight: bold;
          color: green;
        }

        .stock.out {
          color: red;
        }

        .variants {
          margin: 20px 0;
        }

        .variantList {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .variantList button {
          padding: 8px 12px;
          border: 1px solid #ddd;
          background: #fff;
          cursor: pointer;
          border-radius: 6px;
        }

        .variantList .active {
          background: black;
          color: #fff;
        }

        .cartBtn {
          margin: 20px 0;
          padding: 12px;
          width: 100%;
          border: none;
          background: black;
          color: white;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
        }

        .cartBtn:disabled {
          background: #aaa;
        }

        .section {
          margin-top: 20px;
        }

        .section h3 {
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
}
