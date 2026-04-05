"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import ProductForm from "./ProductForm";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await axios.get("/api/admin/products");
    if (data.success) setProducts(data.products);
    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Products</h1>
      <ProductForm onSuccess={fetchProducts} product={editingProduct} setProduct={setEditingProduct} />

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>GST</th>
            <th>Price</th>
            <th>MRP</th>
            <th>Cost Price</th>
            <th>Discount %</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={10}>Loading...</td></tr>
          ) : products.length === 0 ? (
            <tr><td colSpan={10}>No products found</td></tr>
          ) : products.map(p => (
            <tr key={p._id}>
              <td>
                {p.images?.[0] && (
                  <Image src={p.images[0]} alt={p.name} width={50} height={50} />
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.category} / {p.gstCategory}</td>
              <td>{p.gst}%</td>
              <td>{p.price}</td>
              <td>{p.mrp}</td>
              <td>{p.costPrice}</td>
              <td>{p.discount || 0}</td>
              <td>{p.active ? "Active" : "Inactive"}</td>
              <td>
                <button onClick={() => setEditingProduct(p)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
