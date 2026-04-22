"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export async function generateMetadata({ params }) {
  const res = await fetch(`https://shopnative.in/api/products/${params.slug}`);
  const data = await res.json();

  return {
    title: data.product.name,
    description: data.product.shortDescription,
    openGraph: {
      images: data.product.images,
    },
  };
}

export default function ProductPage({ params }) {
  const { slug } = params;

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  /* ================= LOAD PRODUCT ================= */

  useEffect(() => {
    async function loadProduct() {
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();

      setProduct(data.product);
      setVariants(data.variants || []);
      setSelectedVariant(data.product);
    }

    loadProduct();
  }, [slug]);

  if (!product) return <p style={{ padding: 40 }}>Loading...</p>;

  /* ================= PRICE ================= */

  const discount =
    selectedVariant?.mrp && selectedVariant?.sellingPrice
      ? Math.round(
          ((selectedVariant.mrp - selectedVariant.sellingPrice) /
            selectedVariant.mrp) *
            100
        )
      : 0;

  return (
    <div className="container">

      {/* ================= LEFT: IMAGES ================= */}
      <div className="images">
        <div className="mainImg">
          <img src={selectedVariant.images?.[activeImage]} alt={product.name} />
        </div>

        <div className="thumbs">
          {selectedVariant.images?.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setActiveImage(i)}
              className={activeImage === i ? "active" : ""}
            />
          ))}
        </div>
      </div>

      {/* ================= RIGHT: DETAILS ================= */}
      <div className="details">

        <h1>{product.name}</h1>

        <p className="short">{product.shortDescription}</p>

        {/* PRICE */}
        <div className="priceBox">
          <span className="price">₹{selectedVariant.sellingPrice}</span>
          {selectedVariant.mrp && (
            <>
              <span className="mrp">₹{selectedVariant.mrp}</span>
              <span className="discount">{discount}% OFF</span>
            </>
          )}
        </div>

        {/* VARIANTS */}
        {variants.length > 0 && (
          <div className="variants">
            <p>Select Variant:</p>

            <div className="variantList">
              {variants.map((v) => (
                <button
                  key={v._id}
                  className={
                    selectedVariant._id === v._id ? "active" : ""
                  }
                  onClick={() => {
                    setSelectedVariant(v);
                    setActiveImage(0);
                  }}
                >
                  {v.variant}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="cta">
          <button className="buy">Buy Now</button>
          <button className="cart">Add to Cart</button>
        </div>

        {/* EXTRA INFO */}
        <div className="infoBox">
          <p><b>Category:</b> {product.category}</p>
          <p><b>GST:</b> {product.tax}%</p>
          <p><b>HSN:</b> {product.hsn}</p>
          <p><b>Shelf Life:</b> {product.shelfLife}</p>
          <p><b>FSSAI:</b> {product.fssai}</p>
        </div>

      </div>

      {/* ================= DESCRIPTION ================= */}
      <div className="fullDesc">
        <h2>Description</h2>
        <p>{product.description}</p>

        <h3>Ingredients</h3>
        <p>{product.ingredients}</p>
      </div>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: auto;
          padding: 30px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .images {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .mainImg img {
          width: 100%;
          border-radius: 12px;
        }

        .thumbs {
          display: flex;
          gap: 10px;
        }

        .thumbs img {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid transparent;
        }

        .thumbs img.active {
          border: 2px solid black;
        }

        .details h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }

        .short {
          color: #666;
          margin-bottom: 15px;
        }

        .priceBox {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .price {
          font-size: 26px;
          font-weight: bold;
        }

        .mrp {
          text-decoration: line-through;
          color: #888;
        }

        .discount {
          color: green;
          font-weight: bold;
        }

        .variants {
          margin-bottom: 20px;
        }

        .variantList {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .variantList button {
          padding: 8px 14px;
          border: 1px solid #ddd;
          border-radius: 20px;
          background: white;
          cursor: pointer;
        }

        .variantList button.active {
          background: black;
          color: white;
        }

        .cta {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }

        .buy {
          flex: 1;
          padding: 14px;
          background: black;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: bold;
        }

        .cart {
          flex: 1;
          padding: 14px;
          background: #eee;
          border: none;
          border-radius: 10px;
        }

        .infoBox {
          background: #f8f8f8;
          padding: 15px;
          border-radius: 10px;
        }

        .fullDesc {
          grid-column: span 2;
          margin-top: 40px;
        }
      `}</style>
    </div>
  );
}
