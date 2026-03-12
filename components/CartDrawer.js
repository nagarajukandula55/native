"use client"

import Link from "next/link"
import { useCart } from "@/context/CartContext"

export default function CartDrawer({open,setOpen}){

const {cart,cartTotal,removeFromCart} = useCart()

return(

<div
style={{
position:"fixed",
top:0,
right: open ? "0" : "-400px",
width:"350px",
height:"100%",
background:"#fff",
boxShadow:"-5px 0 20px rgba(0,0,0,0.1)",
padding:"20px",
transition:"0.3s",
zIndex:9999,
display:"flex",
flexDirection:"column"
}}
>

<h2 style={{marginBottom:"20px"}}>Your Cart</h2>

{cart.length === 0 ? (

<p>Cart is empty</p>

) : (

<>
<div style={{flex:1,overflowY:"auto"}}>

{cart.map(item=>(

<div
key={item._id}
style={{
display:"flex",
justifyContent:"space-between",
marginBottom:"15px",
borderBottom:"1px solid #eee",
paddingBottom:"10px"
}}
>

<div>
<p style={{fontWeight:"500"}}>{item.name}</p>
<p style={{fontSize:"14px"}}>Qty: {item.quantity}</p>
</div>

<div>

<p>₹{item.price * item.quantity}</p>

<button
onClick={()=>removeFromCart(item._id)}
style={{
border:"none",
background:"none",
color:"red",
cursor:"pointer"
}}
>
Remove
</button>

</div>

</div>

))}

</div>

<h3 style={{marginTop:"20px"}}>Total: ₹{cartTotal}</h3>

<Link href="/checkout">

<button
style={{
marginTop:"15px",
width:"100%",
padding:"12px",
background:"#c28b45",
border:"none",
borderRadius:"25px",
color:"#fff",
cursor:"pointer"
}}
>
Checkout
</button>

</Link>

</>

)}

<button
onClick={()=>setOpen(false)}
style={{
position:"absolute",
top:"15px",
right:"15px",
border:"none",
background:"none",
fontSize:"20px",
cursor:"pointer"
}}
>
✕
</button>

</div>

)

}
