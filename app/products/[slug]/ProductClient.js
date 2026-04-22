"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ProductClient({ slug }) {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  async function loadProduct() {
    try {
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();

      setProduct(data.product);
      setSelectedVariant(data.product);

      if (data.product?.images?.length > 0) {
        setSelectedImage(data.product.images[0]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (!product) return <p style={{ padding: 20 }}>Loading product...</p>;

  return (
    <div style={container}>
      <div style={grid}>
        {/* IMAGE SECTION */}
        <div>
          <div style={mainImageBox}>
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={product.name}
                width={500}
                height={500}
                style={{ objectFit: "contain" }}
              />
            )}
          </div>

          <div style={thumbRow}>
            {product.images?.map((img, i) => (
              <img
                key={i}
                src={img}
                style={thumb}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        {/* DETAILS */}
        <div>
          <h1 style={title}>{product.name}</h1>

          <p style={price}>
            ₹{product.sellingPrice}
            {product.mrp && (
              <span style={mrp}>₹{product.mrp}</span>
            )}
          </p>

          {product.discount > 0 && (
            <p style={discount}>{product.discount}% OFF</p>
          )}

          {/* VARIANT */}
          {product.variants?.length > 0 && (
            <div>
              <p><b>Select Variant</b></p>
              <div style={variantWrap}>
                {product.variants.map((v) => (
                  <button
                    key={v.sku}
                    style={
                      selectedVariant?.sku === v.sku
                        ? variantActive
                        : variantBtn
                    }
                    onClick={() => setSelectedVariant(v)}
                  >
                    {v.variant}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p style={{ marginTop: 20 }}>{product.shortDescription}</p>

          {/* FOOD INFO */}
          <div style={infoBox}>
            <p><b>Ingredients:</b> {product.ingredients}</p>
            <p><b>Shelf Life:</b> {product.shelfLife}</p>
            <p><b>FSSAI:</b> {product.fssai}</p>
          </div>

          {/* GST */}
          <div style={gstBox}>
            <p><b>HSN:</b> {product.hsn}</p>
            <p><b>Tax:</b> {product.tax}%</p>
          </div>

          <button style={buyBtn}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  maxWidth: 1200,
  margin: "auto",
  padding: 20,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 40,
};

const mainImageBox = {
  border: "1px solid #eee",
  borderRadius: 10,
  padding: 10,
};

const thumbRow = {
  display: "flex",
  gap: 10,
  marginTop: 10,
};

const thumb = {
  width: 70,
  height: 70,
  objectFit: "cover",
  border: "1px solid #ddd",
  cursor: "pointer",
};

const title = {
  fontSize: 28,
  fontWeight: "bold",
};

const price = {
  fontSize: 24,
  marginTop: 10,
};

const mrp = {
  textDecoration: "line-through",
  marginLeft: 10,
  color: "#888",
};

const discount = {
  color: "green",
  fontWeight: "bold",
};

const variantWrap = {
  display: "flex",
  gap: 10,
  marginTop: 10,
};

const variantBtn = {
  padding: "8px 12px",
  border: "1px solid #ddd",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
};

const variantActive = {
  ...variantBtn,
  background: "#000",
  color: "#fff",
};

const infoBox = {
  marginTop: 20,
  background: "#f9f9f9",
  padding: 10,
  borderRadius: 8,
};

const gstBox = {
  marginTop: 10,
  background: "#f1f1f1",
  padding: 10,
  borderRadius: 8,
};

const buyBtn = {
  marginTop: 20,
  padding: 14,
  width: "100%",
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 16,
};
