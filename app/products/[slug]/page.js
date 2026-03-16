"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useCart } from "@/context/CartContext"

export default function ProductViewPage() {
  const { slug } = useParams()   // gets slug from URL
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${slug}`)   // fetch by slug
        if (!res.ok) throw new Error("Product not found")
        const data = await res.json()
        setProduct(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  if (loading) return <p>Loading product...</p>
  if (error) return <p style={{color:"red"}}>{error}</p>

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px" }}>
      <h1>{product.name}</h1>
      <p>₹{product.price}</p>
      <img src={product.image} alt={product.name} style={{ width: "100%", maxWidth: "400px" }} />
      <p>{product.description || "No description available."}</p>
      <button onClick={() => addToCart(product)}>Add to Cart</button>

      {/* Placeholder for blog posts */}
      <div style={{ marginTop: "50px" }}>
        <h2>Related Articles</h2>
        <p>Coming soon...</p>
      </div>
    </div>
  )
}
