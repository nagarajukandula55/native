"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";

export default function ProductsPage() {
  const router = useRouter();

  const emptyForm = {
    name: "",
    sku: "",
    sellingPrice: "",
    mrp: "",
    costPrice: "",
    category: "",
    subCategory: "",
    gstCategory: "",
    description: "",
    shortDescription: "",
    image: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  /* ================= HARD AUTH GUARD (FIXED) ================= */
  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const allowedRoles = ["admin", "super_admin", "vendor"];

    if (!allowedRoles.includes(user.role)) {
      router.replace("/");
    }
  }, [user, authReady, router]);

  /* ================= BLOCK RENDER UNTIL AUTH READY ================= */
  if (!authReady || loading) {
    return <p style={{ padding: 20 }}>Checking access...</p>;
  }

  if (!user) return null;

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch("/api/admin/products", {
        credentials: "include",
      });
  
      /* 🔥 HANDLE AUTH FAILURE */
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
  
      const data = await res.json();
      setProducts(data.products || []);
  
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }

  async function loadCategories() {
    try {
      const res = await fetch("/api/admin/categories", {
        credentials: "include",
      });

      const data = await res.json();
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (err) {
      console.error("CATEGORY LOAD ERROR", err);
      setCategories([]);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.sku || !form.sellingPrice) {
      return alert("Name, SKU & Price required");
    }

    setSaving(true);

    try {
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          sellingPrice: Number(form.sellingPrice),
          mrp: Number(form.mrp),
          costPrice: Number(form.costPrice),
        }),
      });

      setForm(emptyForm);
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    }

    setSaving(false);
  }

  const websiteCats = categories.filter((c) => c.type === "website");
  const subCats = categories.filter((c) => c.type === "sub");
  const gstCats = categories.filter((c) => c.type === "gst");

  return (
    <div style={container}>
      <h1 style={title}>🛍 Product Management</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} style={formBox}>
        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} />
        <input name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} />

        <input name="sellingPrice" type="number" placeholder="Selling Price" value={form.sellingPrice} onChange={handleChange} />
        <input name="mrp" type="number" placeholder="MRP" value={form.mrp} onChange={handleChange} />
        <input name="costPrice" type="number" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} />

        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Website Category</option>
          {websiteCats.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select name="subCategory" value={form.subCategory} onChange={handleChange}>
          <option value="">Sub Category</option>
          {subCats.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select name="gstCategory" value={form.gstCategory} onChange={handleChange}>
          <option value="">GST Category</option>
          {gstCats.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <textarea
          name="shortDescription"
          placeholder="Short Description"
          value={form.shortDescription}
          onChange={handleChange}
          style={{ gridColumn: "span 2" }}
        />

        <textarea
          name="description"
          placeholder="Full Description"
          value={form.description}
          onChange={handleChange}
          style={{ gridColumn: "span 2" }}
        />

        <button disabled={saving} style={btn}>
          {saving ? "Saving..." : "Add Product"}
        </button>
      </form>

      {/* LIST */}
      <div style={{ marginTop: 40 }}>
        <h2>Products List</h2>

        {products.length === 0 ? (
          <p>No products found</p>
        ) : (
          <div style={list}>
            {products.map((p) => (
              <div key={p._id} style={card}>
                <h4>{p.name}</h4>
                <p>SKU: {p.sku}</p>
                <p>₹{p.sellingPrice}</p>
              </div>
            ))}
          </div>
        )}
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

const title = {
  fontSize: 28,
  fontWeight: "bold",
  marginBottom: 20,
};

const formBox = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
};

const btn = {
  gridColumn: "span 2",
  padding: 12,
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const list = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))",
  gap: 15,
};

const card = {
  padding: 15,
  border: "1px solid #eee",
  borderRadius: 10,
  background: "#fff",
};
