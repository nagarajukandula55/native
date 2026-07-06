"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getPublicVendor, getPublicVendorProducts } from "@/lib/an-sdk/vendors";
import WishlistButton from "@/components/WishlistButton";

export default function VendorStorefrontPage() {
  const params = useParams();
  const id = params?.id;
  const { addToCart } = useCart();

  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    Promise.allSettled([getPublicVendor(id), getPublicVendorProducts(id)]).then(
      ([vendorRes, productsRes]) => {
        if (cancelled) return;

        if (vendorRes.status === "fulfilled") {
          setVendor(vendorRes.value?.vendor || vendorRes.value);
        } else {
          setNotFound(true);
        }

        if (productsRes.status === "fulfilled") {
          const data = productsRes.value;
          setProducts(data?.products || (Array.isArray(data) ? data : []));
        }

        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p style={{ padding: 40 }}>Loading vendor storefront...</p>;
  }

  if (notFound || !vendor) {
    return (
      <div className="container">
        <p>This vendor storefront isn't available yet.</p>
        <Link href="/products" className="link">
          Browse all products
        </Link>
        <style jsx>{`
          .container {
            max-width: 700px;
            margin: 60px auto;
            text-align: center;
          }
          .link {
            color: #c28b45;
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="banner">
        {vendor.logo && <img src={vendor.logo} alt={vendor.businessName} className="logo" />}
        <div>
          <h1>{vendor.businessName || vendor.name}</h1>
          {vendor.description && <p className="desc">{vendor.description}</p>}
        </div>
      </section>

      <h2>Products from {vendor.businessName || vendor.name}</h2>

      {!products.length ? (
        <p className="empty">No products listed yet.</p>
      ) : (
        <div className="grid">
          {products.map((p) => (
            <div className="card" key={p._id || p.id}>
              <Link href={`/products/${p.slug}`} className="link">
                <div className="imgWrap">
                  <img src={p.images?.[0] || "/no-image.png"} alt={p.displayName || p.name} />
                </div>
                <div className="content">
                  <h3>{p.displayName || p.name}</h3>
                  <p className="price">₹{p.displayPrice || p.price || 0}</p>
                </div>
              </Link>
              <div className="wishlistWrap">
                <WishlistButton
                  product={{
                    productId: p._id,
                    slug: p.slug,
                    name: p.displayName || p.name,
                    price: p.displayPrice || p.price || 0,
                    image: p.images?.[0] || "",
                  }}
                />
              </div>
              <button
                className="addBtn"
                onClick={() =>
                  addToCart({
                    _id: p._id,
                    productId: p._id,
                    productKey: p.productKey || p._id,
                    name: p.displayName || p.name,
                    slug: p.slug,
                    price: Number(p.displayPrice || p.price || 0),
                    image: p.images?.[0] || "/no-image.png",
                    qty: 1,
                  })
                }
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px 60px;
        }
        .banner {
          display: flex;
          align-items: center;
          gap: 20px;
          background: #fff;
          border-radius: 14px;
          padding: 28px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          margin-bottom: 30px;
        }
        .logo {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          object-fit: cover;
        }
        .banner h1 {
          margin: 0 0 6px;
        }
        .desc {
          margin: 0;
          color: #666;
          max-width: 600px;
        }
        h2 {
          margin-bottom: 16px;
        }
        .empty {
          color: #888;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        .card {
          position: relative;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        .link {
          text-decoration: none;
          color: inherit;
        }
        .imgWrap img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }
        .content {
          padding: 12px;
        }
        .content h3 {
          margin: 0 0 4px;
          font-size: 15px;
        }
        .price {
          margin: 0;
          color: #c28b45;
          font-weight: 700;
        }
        .wishlistWrap {
          position: absolute;
          top: 10px;
          right: 10px;
        }
        .addBtn {
          width: calc(100% - 24px);
          margin: 0 12px 12px;
          padding: 8px;
          background: #c28b45;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .addBtn:hover {
          background: #a36d32;
        }
      `}</style>
    </div>
  );
}
