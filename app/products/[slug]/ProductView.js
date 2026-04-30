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

  /* 🔥 SAFETY */
  if (!p) return null;

  /* ================= NORMALIZE VARIANT ================= */
  const normalizeVariant = (v) => ({
    ...v,
    variant:
      v.variant ||
      (v.value && v.unit ? `${v.value}${v.unit}` : "Default"),
    images: v.images?.length ? v.images : p.images,
  });

  const normalizedVariants = variants.map(normalizeVariant);

  const [selectedVariant, setSelectedVariant] = useState(
    normalizeVariant(currentVariant || normalizedVariants[0] || {})
  );

  const [selectedImage, setSelectedImage] = useState(
    selectedVariant?.images?.[0] || p.images?.[0] || "/no-image.png"
  );

  const [toast, setToast] = useState("");

  /* ================= IMAGE SYNC ================= */
  useEffect(() => {
    setSelectedImage(
      selectedVariant?.images?.[0] ||
        p.images?.[0] ||
        "/no-image.png"
    );
  }, [selectedVariant, p.images]);

  /* ================= PRICE ================= */
  const price =
    selectedVariant?.sellingPrice ?? p?.sellingPrice ?? 0;

  const mrp =
    selectedVariant?.mrp ?? p?.mrp ?? 0;

  const finalDiscount =
    mrp > 0
      ? Math.round(((mrp - price) / mrp) * 100)
      : discount;

  /* ================= STOCK ================= */
  const availableStock =
    selectedVariant?.stock ?? stock ?? 0;

  /* ================= ADD TO CART ================= */
  function handleAddToCart() {
    if (availableStock === 0) return;

    const item = {
      id:
        selectedVariant?._id ||
        `${p._id}-${selectedVariant?.variant}`,

      productId: p._id,
      productKey: p.productKey,

      name: p.name,

      price,
      mrp,

      image: selectedImage,

      variant: selectedVariant?.variant,

      qty: 1,
    };

    console.log("ADD TO CART:", item);

    addToCart(item);

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
        {normalizedVariants.length > 1 && (
          <div className="variants">
            <h4>Select Variant</h4>

            <div className="variantList">
              {normalizedVariants.map((v) => (
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
          </div>
        )}

        {/* ADD TO CART */}
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
              {p.ingredients.map((i, idx) => (
                <li key={idx}>
                  {i.name} - {i.qty}{i.unit}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}

      {/* STYLES */}
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
          border-radius: 6px;
          border: 2px solid transparent;
        }

        .thumbs img.active {
          border-color: black;
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

        .stock {
          margin: 10px 0;
          font-weight: bold;
          color: green;
        }

        .stock.out {
          color: red;
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
          margin-top: 20px;
          padding: 12px;
          width: 100%;
          background: black;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: black;
          color: white;
          padding: 10px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
