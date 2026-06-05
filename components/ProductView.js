"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function ProductView({
  product,
  variants = [],
}) {
  const { addToCart } = useCart();

  const [selectedImage, setSelectedImage] = useState(
    product?.images?.[0] || ""
  );

  const [selectedVariant, setSelectedVariant] = useState(
    variants?.[0] || {}
  );

  const mrp =
    selectedVariant?.mrp ??
    product?.mrp ??
    0;

  const sellingPrice =
    selectedVariant?.sellingPrice ??
    product?.sellingPrice ??
    0;

  const discount =
    mrp > 0
      ? Math.round(
          ((mrp - sellingPrice) / mrp) * 100
        )
      : 0;

  const images =
    product?.images?.map((img) =>
      img.replace(/\[|\]/g, "").split(")(")[0]
    ) || [];

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      productId: product._id,
      productKey: product.productKey,
      name: product.name,
      price: sellingPrice,
      mrp,
      image: selectedImage,
      variant:
        selectedVariant?.value
          ? `${selectedVariant.value}${selectedVariant.unit}`
          : "Default",
      qty: 1,
    });
  };

  const handleShare = () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.name,
        url,
      });
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          `${product.name}\n${url}`
        )}`,
        "_blank"
      );
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.name,
    image: images,
    description: product?.description,
    brand: {
      "@type": "Brand",
      name: product?.brand || "Native",
    },
    offers: {
      "@type": "Offer",
      price: sellingPrice,
      priceCurrency: "INR",
      availability:
        "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData
          ),
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(350px,1fr))",
            gap: "40px",
          }}
        >
          {/* LEFT */}
          <div>
            {selectedImage && (
              <img
                src={selectedImage}
                alt={product.name}
                style={{
                  width: "100%",
                  borderRadius: "12px",
                }}
              />
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "10px",
                flexWrap: "wrap",
              }}
            >
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() =>
                    setSelectedImage(img)
                  }
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    cursor: "pointer",
                    border:
                      selectedImage === img
                        ? "2px solid #000"
                        : "1px solid #ddd",
                  }}
                />
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <h1>{product.name}</h1>

            <div
              style={{
                margin: "20px 0",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              >
                ₹{sellingPrice}
              </span>

              {mrp > sellingPrice && (
                <>
                  <span
                    style={{
                      marginLeft: "10px",
                      textDecoration:
                        "line-through",
                      color: "#888",
                    }}
                  >
                    ₹{mrp}
                  </span>

                  <span
                    style={{
                      marginLeft: "10px",
                      color: "green",
                      fontWeight: "700",
                    }}
                  >
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {variants.length > 0 && (
              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <strong>Size:</strong>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  {variants.map((v) => (
                    <button
                      key={v._id}
                      onClick={() =>
                        setSelectedVariant(v)
                      }
                      style={{
                        padding:
                          "8px 15px",
                        border:
                          "1px solid #ddd",
                        borderRadius:
                          "8px",
                        background:
                          "#fff",
                      }}
                    >
                      {v.value}
                      {v.unit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p>
              {product.description}
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "25px",
              }}
            >
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  background: "#000",
                  color: "#fff",
                  border: "none",
                  padding: "14px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                Add To Cart
              </button>

              <button
                onClick={handleShare}
                style={{
                  padding:
                    "14px 20px",
                  border:
                    "1px solid #ddd",
                  background: "#fff",
                  borderRadius:
                    "10px",
                  cursor: "pointer",
                }}
              >
                Share
              </button>
            </div>

            <hr
              style={{
                margin: "30px 0",
              }}
            />

            {product?.ingredients?.length >
              0 && (
              <>
                <h3>Ingredients</h3>

                <ul>
                  {product.ingredients.map(
                    (item) => (
                      <li key={item._id}>
                        {item.name}
                      </li>
                    )
                  )}
                </ul>
              </>
            )}

            {product?.usageInstructions && (
              <>
                <h3>
                  Usage Instructions
                </h3>
                <p>
                  {
                    product.usageInstructions
                  }
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
