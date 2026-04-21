"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";

function ProductsContent() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products", {
          cache: "no-store",
        });

        // 🔥 Handle non-JSON / 404 safely
        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid JSON response");
        }

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch products");
        }

        // ✅ Flexible handling (prevents your warning completely)
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data?.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          console.warn("Unexpected API response:", data);
          setProducts([]);
        }

      } catch (err) {
        console.error("Product fetch error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      !search ||
      product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      {/* TITLE */}
      <h1 className="text-4xl font-semibold text-center mb-4">
        Our Products
      </h1>

      {/* SEARCH INFO */}
      {search && (
        <p className="text-center text-gray-500 mb-8">
          Showing results for <b>"{search}"</b>
        </p>
      )}

      {/* LOADING */}
      {loading ? (
        <p className="text-center">Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center">No products found</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

          {filteredProducts.map((product) => (
            <div
              key={product._id || product.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >

              {/* IMAGE */}
              <Link href={`/products/${product.slug || product._id}`}>
                <img
                  src={product.image || "/placeholder.png"}
                  alt={product.name || "Product"}
                  className="w-full h-52 object-cover"
                />
              </Link>

              <div className="p-4">

                {/* NAME */}
                <Link href={`/products/${product.slug || product._id}`}>
                  <h3 className="text-lg font-medium mb-2 text-gray-800 hover:underline">
                    {product.name || "Unnamed Product"}
                  </h3>
                </Link>

                {/* DESCRIPTION */}
                <p className="text-sm text-gray-500 mb-3 min-h-[40px]">
                  {product.description?.slice(0, 60) ||
                    "Natural healthy product"}
                </p>

                {/* PRICE + BUTTON */}
                <div className="flex items-center justify-between">

                  <span className="text-lg font-semibold text-yellow-700">
                    ₹{product.price ?? 0}
                  </span>

                  <button
                    onClick={() => addToCart(product)}
                    className="px-4 py-2 bg-yellow-700 text-white rounded-full hover:bg-yellow-800 transition"
                  >
                    Add
                  </button>

                </div>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="text-center">Loading...</p>}>
      <ProductsContent />
    </Suspense>
  );
}
