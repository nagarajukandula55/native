"use client"

import { useCart } from "@/context/CartContext"
import Link from "next/link"

export default function CartDrawer({ open, setOpen }) {

  const {
    cart,
    increaseQty,
    decreaseQty,
    removeFromCart
  } = useCart()

  const total = cart.reduce(
    (sum,item)=> sum + item.price * item.quantity,
    0
  )

  if(!open) return null

  return (

    <div
      style={{
        position:"fixed",
        top:0,
        right:0,
        width:"350px",
        height:"100vh",
        bottom:0,
        paddingBottom:"80px",
        background:"#fff",
        boxShadow:"-4px 0 20px rgba(0,0,0,0.1)",
        padding:"20px",
        zIndex:2000,
        overflowY:"auto",
        display:"flex",
        flexDirection:"column"
      }}
    >

      {/* CLOSE */}
      <button
        onClick={() => setOpen()}
        style={{
          position:"absolute",
          right:"15px",
          top:"10px",
          border:"none",
          background:"none",
          fontSize:"20px",
          cursor:"pointer"
        }}
      >
        ✕
      </button>

      <h2 style={{marginBottom:"20px"}}>Cart</h2>

      {cart.length === 0 && (
        <p>Your cart is empty</p>
      )}

      <div style={{flex:1}}>

        {cart.map(item => (

          <div
            key={item._id}
            style={{
              borderBottom:"1px solid #eee",
              padding:"10px 0"
            }}
          >

            <h4>{item.name}</h4>
            <p>₹{item.price}</p>

            <div
              style={{
                display:"flex",
                alignItems:"center",
                gap:"10px",
                marginTop:"5px"
              }}
            >

              <button onClick={()=>decreaseQty(item._id)}>-</button>

              <span>{item.quantity}</span>

              <button onClick={()=>increaseQty(item._id)}>+</button>

            </div>

            <button
              onClick={()=>removeFromCart(item._id)}
              style={{
                marginTop:"5px",
                background:"none",
                border:"none",
                color:"red",
                cursor:"pointer"
              }}
            >
              Remove
            </button>

          </div>

        ))}

      </div>

      {cart.length > 0 && (

        <div style={{marginTop:"20px"}}>

          <h3>Total: ₹{total}</h3>

          <Link
            href="/checkout"
            onClick={() => setOpen()}
          >
            <button
              style={{
                width:"100%",
                marginTop:"10px",
                padding:"12px",
                border:"none",
                background:"#c28b45",
                color:"#fff",
                borderRadius:"6px",
                fontSize:"16px",
                cursor:"pointer"
              }}
            >
              Checkout
            </button>
          </Link>

        </div>

      )}

    </div>

  )

}
