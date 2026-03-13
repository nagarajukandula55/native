"use client"

import { useCart } from "@/context/CartContext"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Checkout(){

const { cart } = useCart()
const router = useRouter()

const [loading,setLoading] = useState(false)

const [form,setForm] = useState({
name:"",
phone:"",
address:"",
pincode:""
})

function handleChange(e){
setForm({...form,[e.target.name]:e.target.value})
}

async function placeOrder(){

if(!form.name || !form.phone || !form.address){
alert("Fill all details")
return
}

setLoading(true)

try{

const res = await fetch("/api/orders",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({
customerName:name,
phone,
email,
address,
pincode,
items:cart
})
})

const data = await res.json()

clearCart()

router.push(`/order-success?orderId=${data.orderId}`)

}catch(err){
alert("Order failed")
}

setLoading(false)

}

const total = cart.reduce(
(sum,item)=> sum + item.price * item.quantity,
0
)

return(

<div style={{maxWidth:"600px",margin:"50px auto"}}>

<h2>Checkout</h2>

<input name="name" placeholder="Name" onChange={handleChange}/>
<br/><br/>

<input name="phone" placeholder="Phone" onChange={handleChange}/>
<br/><br/>

<textarea name="address" placeholder="Address" onChange={handleChange}/>
<br/><br/>

<input name="pincode" placeholder="Pincode" onChange={handleChange}/>
<br/><br/>

<h3>Total ₹{total}</h3>

<button onClick={placeOrder}>
{loading ? "Placing..." : "Place Order"}
</button>

</div>

)

}
