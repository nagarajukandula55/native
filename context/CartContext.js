"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {

  const [cart,setCart] = useState([])
  const [drawerOpen,setDrawerOpen] = useState(false)

  // LOAD CART
  useEffect(()=>{
    const saved = localStorage.getItem("cart")
    if(saved){
      setCart(JSON.parse(saved))
    }
  },[])

  // SAVE CART
  useEffect(()=>{
    localStorage.setItem("cart", JSON.stringify(cart))
  },[cart])

  function openCart(){
    setDrawerOpen(true)
  }

  function closeCart(){
    setDrawerOpen(false)
  }

  function addToCart(product){

    setCart(prev=>{

      const exists = prev.find(p=>p._id === product._id)

      if(exists){
        return prev.map(p =>
          p._id === product._id
          ? { ...p, quantity: p.quantity + 1 }
          : p
        )
      }

      return [...prev,{...product, quantity:1}]
    })

    // ⭐ auto open drawer
    setDrawerOpen(true)
  }

  function increaseQty(id){
    setCart(prev =>
      prev.map(p =>
        p._id === id
        ? { ...p, quantity: p.quantity + 1 }
        : p
      )
    )
  }

  function decreaseQty(id){
    setCart(prev =>
      prev.map(p =>
        p._id === id
        ? { ...p, quantity: Math.max(1,p.quantity - 1) }
        : p
      )
    )
  }

  function removeFromCart(id){
    setCart(prev => prev.filter(p => p._id !== id))
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        drawerOpen,
        openCart,
        closeCart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(){
  return useContext(CartContext)
}
