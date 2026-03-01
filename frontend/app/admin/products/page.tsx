"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const token = getToken();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const data = await apiRequest("/api/products", "GET", undefined, token || "");
    setProducts(data);
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Products</h1>
      <ul>
        {products.map((p: any) => (
          <li key={p._id} className="border p-2 mb-2">
            {p.name} - ₹{p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
