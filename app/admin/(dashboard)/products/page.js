"use client";

import { useEffect, useState } from "react";
import ProductForm from "../../components/ProductForm";
import ProductTable from "../../components/ProductTable";
import StatsCards from "../../components/StatsCards";

export default function Page() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products);
  }

  return (
    <div className="space-y-6">
      <StatsCards products={products} />

      <ProductForm
        refresh={load}
        editing={editing}
        setEditing={setEditing}
      />

      <ProductTable
        products={products}
        onEdit={setEditing}
        refresh={load}
      />
    </div>
  );
}
