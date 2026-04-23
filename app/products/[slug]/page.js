import Image from "next/image";

/* ================= SEO ================= */
export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`https://shopnative.in/api/products/${params.slug}`, { cache: "no-store" });
    const data = await res.json();

    const p = data.product || {};

    return {
      title: p?.name || "Product",
      description: p?.shortDescription || "Buy premium quality products online",
      openGraph: {
        title: p?.name,
        description: p?.shortDescription,
        images: p?.images?.[0] ? [p.images[0]] : [],
      },
    };
  } catch {
    return {
      title: "Product",
      description: "Buy online",
    };
  }
}

/* ================= PAGE ================= */
export default async function ProductPage({ params }) {

  const res = await fetch(`https://shopnative.in/api/products/${params.slug}`, {
    cache: "no-store",
  });

  const data = await res.json();

  const p = data.product;
  const variants = data.variants || [];

  /* 🔥 CURRENT VARIANT (IMPORTANT FIX) */
  const currentVariant = variants.find(v => v.slug === params.slug) || p;

  const discount = currentVariant?.mrp && currentVariant?.sellingPrice
    ? Math.round(((currentVariant.mrp - currentVariant.sellingPrice) / currentVariant.mrp) * 100)
    : 0;

  /* 🔥 STOCK LOGIC */
  const stock = currentVariant?.stock || 0;

  const stockText =
    stock > 10 ? "In Stock" :
    stock > 0 ? `Only ${stock} left` :
    "Out of Stock";

  return (
    <div className="container">

      <div className="grid">

        {/* LEFT - IMAGES */}
        <div className="left">

          <Image
            src={p.images?.[0] || "/placeholder.png"}
            width={500}
            height={500}
            alt={p.name}
            className="mainImg"
          />

          <div className="thumbs">
            {p.images?.map((img, i) => (
              <Image key={i} src={img} width={80} height={80} alt="" />
            ))}
          </div>

        </div>

        {/* RIGHT - DETAILS */}
        <div className="right">

          <h1>{p.name}</h1>
          <p className="desc">{p.shortDescription}</p>

          {/* PRICE */}
          <div className="priceBox">
            <span className="price">₹{currentVariant?.sellingPrice}</span>

            {currentVariant?.mrp && (
              <span className="mrp">₹{currentVariant.mrp}</span>
            )}

            {discount > 0 && (
              <span className="off">{discount}% OFF</span>
            )}
          </div>

          {/* STOCK */}
          <div className={`stock ${stock === 0 ? "out" : ""}`}>
            {stockText}
          </div>

          {/* VARIANTS */}
          <div className="variants">
            <h4>Select Variant</h4>

            <div className="variantList">
              {variants.map(v => (
                <a
                  key={v._id}
                  href={`/products/${v.slug}`}
                  className={`variant ${v.slug === params.slug ? "active" : ""}`}
                >
                  {v.variant}
                </a>
              ))}
            </div>
          </div>

          {/* BUY BOX */}
          <div className="buyBox">

            <button
              className="buy"
              disabled={stock === 0}
            >
              Buy Now
            </button>

            <button
              className="cart"
              disabled={stock === 0}
            >
              Add to Cart
            </button>

          </div>

          {/* TRUST */}
          <ul className="trust">
            <li>✔ Premium Quality</li>
            <li>✔ Fast Delivery</li>
            <li>✔ Secure Payment</li>
            <li>✔ GST Billing Available</li>
          </ul>

        </div>

      </div>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: auto;
          padding: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .mainImg {
          border: 1px solid #eee;
          border-radius: 10px;
        }

        .thumbs {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .right h1 {
          font-size: 26px;
          font-weight: 600;
        }

        .desc {
          color: #555;
          margin: 10px 0;
        }

        .priceBox {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 15px 0;
        }

        .price {
          font-size: 26px;
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
          font-weight: 600;
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

        .variant {
          border: 1px solid #ccc;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          color: black;
        }

        .variant.active {
          border: 2px solid black;
          font-weight: bold;
        }

        .variant:hover {
          border-color: black;
        }

        .buyBox {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }

        .buy {
          background: black;
          color: white;
          padding: 12px 20px;
          border: none;
          cursor: pointer;
        }

        .cart {
          border: 1px solid black;
          padding: 12px 20px;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .trust {
          margin-top: 20px;
          color: #444;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

    </div>
  );
}
