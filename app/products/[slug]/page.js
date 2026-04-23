import Image from "next/image";

/* ================= SEO ================= */
export async function generateMetadata({ params }) {
  const res = await fetch(`https://shopnative.in/api/products/${params.slug}`);
  const data = await res.json();

  return {
    title: data.product.name,
    description: data.product.shortDescription,
  };
}

/* ================= PAGE ================= */
export default async function ProductPage({ params }) {

  const res = await fetch(`https://shopnative.in/api/products/${params.slug}`);
  const data = await res.json();

  const p = data.product;
  const variants = data.variants;

  const discount = p.mrp && p.sellingPrice
    ? Math.round(((p.mrp - p.sellingPrice)/p.mrp)*100)
    : 0;

  return (
    <div className="container">

      <div className="grid">

        {/* LEFT - IMAGES */}
        <div className="left">

          <Image
            src={p.images?.[0]}
            width={500}
            height={500}
            alt={p.name}
            className="mainImg"
          />

          <div className="thumbs">
            {p.images?.map((img,i)=>(
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
            <span className="price">₹{p.sellingPrice}</span>
            {p.mrp && <span className="mrp">₹{p.mrp}</span>}
            {discount > 0 && <span className="off">{discount}% OFF</span>}
          </div>

          {/* VARIANTS */}
          <div className="variants">
            <h4>Select Variant</h4>
            <div className="variantList">
              {variants.map(v=>(
                <a key={v._id} href={`/products/${v.slug}`} className="variant">
                  {v.variant}
                </a>
              ))}
            </div>
          </div>

          {/* BUY BOX */}
          <div className="buyBox">
            <button className="buy">Buy Now</button>
            <button className="cart">Add to Cart</button>
          </div>

          {/* TRUST */}
          <ul className="trust">
            <li>✔ Premium Quality</li>
            <li>✔ Fast Delivery</li>
            <li>✔ Secure Payment</li>
          </ul>

        </div>

      </div>

      <style jsx>{`
        .container{max-width:1200px;margin:auto;padding:20px;}

        .grid{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:40px;
        }

        .mainImg{
          border:1px solid #eee;
          border-radius:10px;
        }

        .thumbs{
          display:flex;
          gap:10px;
          margin-top:10px;
        }

        .right h1{font-size:24px;}
        .desc{color:#555;margin:10px 0;}

        .priceBox{
          display:flex;
          align-items:center;
          gap:10px;
          margin:15px 0;
        }

        .price{font-size:24px;font-weight:bold;}
        .mrp{text-decoration:line-through;color:#888;}
        .off{color:green;font-weight:bold;}

        .variantList{
          display:flex;
          gap:10px;
          flex-wrap:wrap;
        }

        .variant{
          border:1px solid #ccc;
          padding:6px 10px;
          border-radius:6px;
          cursor:pointer;
        }

        .variant:hover{
          border-color:black;
        }

        .buyBox{
          margin-top:20px;
          display:flex;
          gap:10px;
        }

        .buy{
          background:black;
          color:white;
          padding:12px 20px;
          border:none;
        }

        .cart{
          border:1px solid black;
          padding:12px 20px;
        }

        .trust{
          margin-top:20px;
          color:#444;
        }

        @media(max-width:768px){
          .grid{grid-template-columns:1fr;}
        }
      `}</style>

    </div>
  );
}
