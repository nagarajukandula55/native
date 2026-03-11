"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function ProductsPage() {

  const [products, setProducts] = useState([])

  useEffect(() => {

    async function fetchProducts() {

      try {

        const res = await fetch("/api/admin/products")

        const data = await res.json()

        setProducts(data)

      } catch (error) {
        console.error("Error fetching products:", error)
      }

    }

    fetchProducts()

  }, [])

  return (
    <div className="container mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Our Products
      </h1>

      {products.length === 0 && (
        <p>No products found</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {products.map((product) => (

          <Link
            key={product._id}
            href={`/products/${product.slug}`}
          >

            <div className="border rounded-lg p-4 hover:shadow-lg transition">

              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-56 object-cover rounded-md mb-3"
                />
              )}
            
              <h2 className="text-lg font-semibold">
                {product.name}
              </h2>
            
              <p className="text-gray-500 text-sm mb-2">
                {product.category}
              </p>
            
              <p className="font-bold text-xl text-green-700">
                ₹{product.price}
              </p>
            
              <p className="text-sm text-gray-600 mt-2">
                Stock: {product.stock}
              </p>
            
            </div>

          </Link>

        ))}

      </div>

    </div>
  )
}
