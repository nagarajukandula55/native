"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function ProductsPage() {

  const [products, setProducts] = useState([])

  useEffect(() => {

    async function fetchProducts() {

      const res = await fetch("/api/admin/products")

      const data = await res.json()

      setProducts(data)

    }

    fetchProducts()

  }, [])

  return (

    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-8">
        Our Products
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {products.map(product => (

          <Link
            key={product._id}
            href={"/products/" + product.slug}
          >

            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">

              <div className="relative w-full h-[220px] bg-gray-100">

                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="300px"
                  className="object-cover"
                />

              </div>

              <div className="p-4">

                <h2 className="font-semibold">
                  {product.name}
                </h2>

                <p className="text-gray-500 text-sm">
                  {product.category}
                </p>

                <p className="font-bold text-green-700 mt-2">
                  ₹{product.price}
                </p>

              </div>

            </div>

          </Link>

        ))}

      </div>

    </div>

  )

}
