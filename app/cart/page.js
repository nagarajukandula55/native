
"use client"

import { useCart } from "@/context/CartContext"

export default function CartPage() {

  const { cart, removeFromCart, increaseQty, decreaseQty } = useCart()

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (

    <div className="max-w-5xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-6">
        Your Cart
      </h1>

      {cart.length === 0 && <p>Your cart is empty.</p>}

      {cart.map(item => (

        <div
          key={item._id}
          className="flex items-center justify-between border-b py-4"
        >

          <div>

            <h2 className="font-semibold">
              {item.name}
            </h2>

            <p>₹{item.price}</p>

          </div>

          <div className="flex items-center gap-3">

            <button onClick={() => decreaseQty(item._id)}>
              -
            </button>

            <span>{item.quantity}</span>

            <button onClick={() => increaseQty(item._id)}>
              +
            </button>

          </div>

          <button
            onClick={() => removeFromCart(item._id)}
            className="text-red-600"
          >
            Remove
          </button>

        </div>

      ))}

      {cart.length > 0 && (

        <div className="mt-6">

          <h2 className="text-xl font-bold">
            Total: ₹{total}
          </h2>

        </div>

      )}

    </div>

  )

}
