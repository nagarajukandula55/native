"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ================= VALIDATION ================= */
function validateProduct(p) {
  const errors = [];

  if (!p.name) errors.push("Missing product name");
  if (!p.images?.length) errors.push("No images");
  if (!p.fssaiNumber) errors.push("Missing FSSAI");

  const price = p.primaryVariant?.sellingPrice || 0;
  const cost =
    (p.baseCost || 0) +
    (p.packagingCost || 0) +
    (p.logisticsCost || 0) +
    (p.marketingCost || 0);

  if (price < cost) errors.push("Selling below cost");

  return errors;
}

export default function ProductView({ params }) {
  const { productKey } = params;

  const [product, setProduct] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const router = useRouter();

  /* ================= LOAD ================= */
  async function loadProduct() {
    const res = await fetch(`/api/admin/products/${productKey}`);
    const data = await res.json();

    if (data.success) {
      setProduct(data.product);
    }
  }

  useEffect(() => {
    loadProduct();
  }, []);

  /* ================= INLINE EDIT ================= */
  function updateField(field, value) {
    setProduct(prev => ({
      ...prev,
      [field]: value
    }));
  }

  function updateVariant(field, value) {
    setProduct(prev => ({
      ...prev,
      primaryVariant: {
        ...prev.primaryVariant,
        [field]: value
      }
    }));
  }

  async function saveChanges() {
    setLoading(true);

    await fetch(`/api/admin/products/${productKey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    setEditMode(false);
    setLoading(false);
    loadProduct();
  }

  /* ================= ACTIONS ================= */

  async function approve() {
    setLoading(true);

    await fetch("/api/admin/products/action", {
      method: "POST",
      body: JSON.stringify({
        productId: product.productKey,
        action: "approve",
      }),
    });

    router.push("/admin/products/review");
  }

  async function reject() {
    if (!rejectionReason) return alert("Enter reason");

    setLoading(true);

    await fetch("/api/admin/products/action", {
      method: "POST",
      body: JSON.stringify({
        productId: product.productKey,
        action: "reject",
        reason: rejectionReason,
      }),
    });

    router.push("/admin/products/review");
  }

  if (!product) return <p>Loading...</p>;

  const errors = validateProduct(product);

  return (
    <div className="wrap">
      <h1>🧾 Moderation Panel</h1>

      {/* ================= ERRORS ================= */}
      {errors.length > 0 && (
        <div className="alert">
          {errors.map((e, i) => <p key={i}>⚠️ {e}</p>)}
        </div>
      )}

      {/* ================= BASIC ================= */}
      <div className="card">

        <label>Name</label>
        <input
          value={product.name}
          disabled={!editMode}
          onChange={(e) => updateField("name", e.target.value)}
        />

        <label>Category</label>
        <input
          value={product.category}
          disabled={!editMode}
          onChange={(e) => updateField("category", e.target.value)}
        />

        <label>Price</label>
        <input
          value={product.primaryVariant?.sellingPrice || ""}
          disabled={!editMode}
          onChange={(e) => updateVariant("sellingPrice", e.target.value)}
        />

      </div>

      {/* ================= IMAGES ================= */}
      <div className="card">
        <h3>Images</h3>
        <div className="gallery">
          {(product.images || []).map((img, i) => (
            <img key={i} src={img} />
          ))}
        </div>
      </div>

      {/* ================= ACTIVITY LOG ================= */}
      <div className="card">
        <h3>🧾 Activity Timeline</h3>

        {(product.activityLog || []).length === 0 ? (
          <p>No activity yet</p>
        ) : (
          <ul>
            {product.activityLog.map((log, i) => (
              <li key={i}>
                <b>{log.action}</b> by {log.user} <br />
                <small>{new Date(log.timestamp).toLocaleString()}</small>
                {log.reason && <p>Reason: {log.reason}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="actions">

        {!editMode ? (
          <button onClick={() => setEditMode(true)}>✏️ Edit</button>
        ) : (
          <button onClick={saveChanges}>💾 Save</button>
        )}

        <button onClick={approve} className="approve">
          Approve
        </button>

        <input
          placeholder="Reject reason"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />

        <button onClick={reject} className="reject">
          Reject
        </button>

      </div>

      <style jsx>{`
        .wrap {
          max-width: 900px;
          margin: auto;
          padding: 20px;
        }

        .card {
          background: #fff;
          padding: 15px;
          border-radius: 10px;
          margin-top: 15px;
        }

        input {
          width: 100%;
          margin-bottom: 10px;
          padding: 6px;
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
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .approve {
          background: green;
          color: white;
        }

        .reject {
          background: red;
          color: white;
        }

        .alert {
          background: #ffecec;
          padding: 10px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
