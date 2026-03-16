"use client"
export const dynamic = "force-dynamic"

import { useCart } from "@/context/CartContext"

export default function CartPage() {
  const { cart, removeFromCart, increaseQty, decreaseQty } = useCart()

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
        Your Cart
      </h1>

      {cart.length === 0 && (
        <p className="text-center text-lg text-gray-500">
          Your cart is empty.
        </p>
      )}

      {cart.map(item => (
        <div
          key={item._id}
          className="flex flex-col sm:flex-row items-center justify-between border-b py-4 gap-4"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <img
              src={item.image}
              alt={item.name}
              className="w-24 h-24 object-cover rounded-lg border"
            />
            <div>
              <h2 className="font-semibold text-lg">{item.name}</h2>
              <p className="text-[#c28b45] font-medium">₹{item.price}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => decreaseQty(item._id)}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              -
            </button>

            <span className="px-3 py-1">{item.quantity}</span>

            <button
              onClick={() => increaseQty(item._id)}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              +
            </button>
          </div>

          <button
            onClick={() => removeFromCart(item._id)}
            className="text-red-600 font-medium hover:underline"
          >
            Remove
          </button>
        </div>
      ))}

      {cart.length > 0 && (
        <div className="mt-8 text-right">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3a2a1c]">
            Total: ₹{total}
          </h2>
        </div>
      )}
    </div>
  )
}
