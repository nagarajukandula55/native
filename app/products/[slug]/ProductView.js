"use client";

import Image from "next/image";

export default function ProductView({ p, variants, currentVariant, discount, stock, stockText }) {

  return (
    <div className="container">

      <div className="grid">

        {/* LEFT */}
        <div>
          <Image
            src={p.images?.[0] || "/placeholder.png"}
            width={500}
            height={500}
            alt={p.name}
          />

          <div className="thumbs">
            {p.images?.map((img, i) => (
              <Image key={i} src={img} width={80} height={80} alt="" />
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div>

          <h1>{p.name}</h1>
          <p>{p.shortDescription}</p>

          <div className="priceBox">
            <span className="price">₹{currentVariant?.sellingPrice}</span>
            {currentVariant?.mrp && <span className="mrp">₹{currentVariant.mrp}</span>}
            {discount > 0 && <span className="off">{discount}% OFF</span>}
          </div>

          <div className={`stock ${stock === 0 ? "out" : ""}`}>
            {stockText}
          </div>

          {/* VARIANTS */}
          <div className="variantList">
            {variants.map(v => (
              <a key={v._id} href={`/products/${v.slug}`}>
                {v.variant}
              </a>
            ))}
          </div>

          {/* BUY */}
          <div className="buyBox">
            <button disabled={stock === 0}>Buy Now</button>
            <button disabled={stock === 0}>Add to Cart</button>
          </div>

        </div>

      </div>

      {/* ✅ SAFE STYLES (Client Allowed) */}
      <style jsx>{`
        .container{max-width:1200px;margin:auto;padding:20px;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;}
        .thumbs{display:flex;gap:10px;margin-top:10px;}
        .priceBox{display:flex;gap:10px;margin:10px 0;}
        .price{font-size:24px;font-weight:bold;}
        .mrp{text-decoration:line-through;color:#888;}
        .off{color:green;}
        .stock{margin:10px 0;color:green;}
        .stock.out{color:red;}
        .variantList{display:flex;gap:10px;flex-wrap:wrap;}
        .buyBox{margin-top:20px;display:flex;gap:10px;}
      `}</style>

    </div>
  );
}
