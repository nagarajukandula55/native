
"use client"

import { createContext, useContext, useEffect, useState } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {

  const [cart, setCart] = useState([])

  useEffect(() => {

    const storedCart = localStorage.getItem("cart")

    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }

  }, [])

  useEffect(() => {

    localStorage.setItem("cart", JSON.stringify(cart))

  }, [cart])


  function addToCart(product) {

    const exists = cart.find(item => item._id === product._id)

    if (exists) {

      setCart(
        cart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )

    } else {

      setCart([...cart, { ...product, quantity: 1 }])

    }

  }


  function removeFromCart(id) {

    setCart(cart.filter(item => item._id !== id))

  }


  function increaseQty(id) {

    setCart(
      cart.map(item =>
        item._id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    )

  }


  function decreaseQty(id) {

    setCart(
      cart.map(item =>
        item._id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    )

  }


  function clearCart() {
    setCart([])
  }


  return (

    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart
      }}
    >

      {children}

    </CartContext.Provider>

  )

}


export function useCart() {
  return useContext(CartContext)
}

