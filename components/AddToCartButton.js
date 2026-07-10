
"use client"

import { useCart } from "@/context/CartContext"

export default function AddToCartButton({ product }) {

  const { addToCart } = useCart()

  return (

    <button
      onClick={() => addToCart(product)}
      className="btn btn-accent"
      style={{ marginTop: 12 }}
    >
      Add To Cart
    </button>

  )

}
