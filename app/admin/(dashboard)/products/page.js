"use client";

import { useEffect, useState } from "react";
import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products);
  }

  return (
    <div className="p-6 space-y-6">
      <ProductForm
        refresh={load}
        editing={editing}
        setEditing={setEditing}
      />

      <ProductTable
        products={products}
        onEdit={setEditing}
        onDelete={load}
      />
    </div>
  );
}
