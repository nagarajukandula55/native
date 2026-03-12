"use client"

import { createContext, useContext, useEffect, useState } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {

  const [cart, setCart] = useState([])

  /* LOAD CART FROM LOCAL STORAGE */

  useEffect(() => {

    const storedCart = localStorage.getItem("cart")

    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }

  }, [])


  /* SAVE CART */

  useEffect(() => {

    localStorage.setItem("cart", JSON.stringify(cart))

  }, [cart])


  /* ADD TO CART */

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


  /* REMOVE ITEM */

  function removeFromCart(id) {

    setCart(cart.filter(item => item._id !== id))

  }


  /* INCREASE QTY */

  function increaseQty(id) {

    setCart(
      cart.map(item =>
        item._id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    )

  }


  /* DECREASE QTY */

  function decreaseQty(id) {

    setCart(
      cart.map(item =>
        item._id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    )

  }


  /* CLEAR CART */

  function clearCart() {
    setCart([])
  }


  /* CART TOTAL PRICE */

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )


  /* TOTAL ITEMS */

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  )


  return (

    <CartContext.Provider
      value={{
        cart,
        cartTotal,
        cartCount,
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
