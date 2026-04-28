"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ================= VALIDATION ENGINE ================= */

function validateProduct(p) {
  const errors = [];

  if (!p.name) errors.push("Missing product name");
  if (!p.images?.length) errors.push("No product images");
  if (!p.fssaiNumber) errors.push("Missing FSSAI number");

  const price = p.primaryVariant?.sellingPrice || 0;
  const cost =
    (p.baseCost || 0) +
    (p.packagingCost || 0) +
    (p.logisticsCost || 0) +
    (p.marketingCost || 0);

  if (price < cost) errors.push("Selling price below cost");

  const totalPercent = (p.ingredients || []).reduce(
    (s, i) => s + Number(i.percent || 0),
    0
  );

  if (Math.abs(totalPercent - 100) > 2) {
    errors.push("Ingredients not equal to 100%");
  }

  return errors;
}

export default function ProductView({ params }) {
  const { productKey } = params;

  const [product, setProduct] = useState(null);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const router = useRouter();

  /* ================= LOAD ================= */

  async function loadProduct() {
    try {
      const res = await fetch(`/api/admin/products/${productKey}`);
      const data = await res.json();

      if (data.success) {
        setProduct(data.product);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadProduct();
  }, []);

  /* ================= ACTIONS ================= */

  async function approve() {
    if (!confirm("Approve this product?")) return;

    setLoading(true);

    await fetch("/api/admin/products/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: product.productKey,
        action: "approve",
      }),
    });

    setLoading(false);
    router.push("/admin/products/review");
  }

  async function reject() {
    if (!rejectionReason) {
      alert("Enter rejection reason");
      return;
    }

    if (!confirm("Reject this product?")) return;

    setLoading(true);

    await fetch("/api/admin/products/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: product.productKey,
        action: "reject",
        reason: rejectionReason,
      }),
    });

    setLoading(false);
    router.push("/admin/products/review");
  }

  if (!product) return <p>Loading...</p>;

  const errors = validateProduct(product);

  const cost =
    (product.baseCost || 0) +
    (product.packagingCost || 0) +
    (product.logisticsCost || 0) +
    (product.marketingCost || 0);

  const price = product.primaryVariant?.sellingPrice || 0;
  const margin = price ? (((price - cost) / price) * 100).toFixed(2) : 0;

  return (
    <div className="wrap">
      <h1>📦 Product Moderation Panel</h1>

      {/* ================= ALERTS ================= */}
      {errors.length > 0 && (
        <div className="alert">
          ⚠️ Issues Found:
          <ul>
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ================= TABS ================= */}
      <div className="tabs">
        {["overview", "ingredients", "pricing", "compliance", "media"].map(
          (t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={tab === t ? "active" : ""}
            >
              {t}
            </button>
          )
        )}
      </div>

      {/* ================= OVERVIEW ================= */}
      {tab === "overview" && (
        <div className="card">
          <h3>{product.name}</h3>
          <p><b>Brand:</b> {product.brand}</p>
          <p><b>Category:</b> {product.category}</p>
          <p><b>SKU:</b> {product.primaryVariant?.sku}</p>
          <p><b>Status:</b> {product.status}</p>
        </div>
      )}

      {/* ================= INGREDIENTS ================= */}
      {tab === "ingredients" && (
        <div className="card">
          <h3>🥗 Ingredients</h3>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Qty</th>
                <th>%</th>
              </tr>
            </thead>

            <tbody>
              {(product.ingredients || []).map((i, idx) => (
                <tr key={idx}>
                  <td>{i.name}</td>
                  <td>{i.qty} {i.unit}</td>
                  <td>{i.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= PRICING ================= */}
      {tab === "pricing" && (
        <div className="card">
          <h3>💰 Pricing</h3>

          <p>Cost: ₹{cost}</p>
          <p>Selling Price: ₹{price}</p>
          <p>Margin: {margin}%</p>

          {price < cost && (
            <p className="danger">⚠️ Loss Product</p>
          )}
        </div>
      )}

      {/* ================= COMPLIANCE ================= */}
      {tab === "compliance" && (
        <div className="card">
          <h3>📜 Compliance</h3>

          <p>FSSAI: {product.fssaiNumber}</p>
          <p>Manufacturer: {product.manufacturerName}</p>
          <p>Country: {product.countryOfOrigin}</p>
          <p>Storage: {product.storageInstructions}</p>
          <p>Allergen: {product.allergenInfo}</p>
        </div>
      )}

      {/* ================= MEDIA ================= */}
      {tab === "media" && (
        <div className="card">
          <h3>🖼 Images</h3>

          <div className="gallery">
            {(product.images || []).map((img, i) => (
              <img key={i} src={img} alt="" />
            ))}
          </div>
        </div>
      )}

      {/* ================= ACTIONS ================= */}
      <div className="actions">
        <button onClick={approve} disabled={loading} className="approve">
          Approve
        </button>

        <input
          placeholder="Rejection reason"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />

        <button onClick={reject} disabled={loading} className="reject">
          Reject
        </button>
      </div>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .wrap {
          max-width: 1000px;
          margin: auto;
          padding: 20px;
        }

        .alert {
          background: #ffecec;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .tabs button {
          margin-right: 10px;
          padding: 8px;
          border: 1px solid #ddd;
          background: #fff;
          cursor: pointer;
        }

        .tabs .active {
          background: black;
          color: white;
        }

        .card {
          background: white;
          padding: 15px;
          border-radius: 10px;
          margin-top: 15px;
        }

        table {
          width: 100%;
          margin-top: 10px;
          border-collapse: collapse;
        }

        td, th {
          border-bottom: 1px solid #eee;
          padding: 8px;
        }

        .gallery {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .gallery img {
          width: 100%;
          border-radius: 8px;
        }

        .actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }

        .approve {
          background: green;
          color: white;
          padding: 10px;
          border: none;
        }

        .reject {
          background: red;
          color: white;
          padding: 10px;
          border: none;
        }

        .danger {
          color: red;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
