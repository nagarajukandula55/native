"use client"

export const dynamic = "force-dynamic"

import { useCart } from "@/context/CartContext"
import { useState } from "react"

export default function CheckoutPage() {

const cartContext = useCart()
const cart = cartContext?.cart || []

const [form, setForm] = useState({
name: "",
phone: "",
address: "",
city: "",
pincode: "",
payment: "COD"
})

const total = cart.reduce(
(sum,item)=> sum + item.price * item.quantity,
0
)

function handleChange(e){

```
setForm({
  ...form,
  [e.target.name]: e.target.value
})
```

}

function placeOrder(){

```
if(cart.length === 0){
  alert("Cart is empty")
  return
}

alert("Order placed (next step we will save it)")
```

}

return(

```
<div
style={{
  maxWidth:"1100px",
  margin:"auto",
  padding:"60px 20px",
  display:"grid",
  gridTemplateColumns:"1fr 400px",
  gap:"40px"
}}
>

  {/* CUSTOMER FORM */}

  <div>

    <h2 style={{marginBottom:"20px"}}>Delivery Details</h2>

    <input
    name="name"
    placeholder="Full Name"
    value={form.name}
    onChange={handleChange}
    style={input}
    />

    <input
    name="phone"
    placeholder="Phone Number"
    value={form.phone}
    onChange={handleChange}
    style={input}
    />

    <textarea
    name="address"
    placeholder="Address"
    value={form.address}
    onChange={handleChange}
    style={input}
    />

    <input
    name="city"
    placeholder="City"
    value={form.city}
    onChange={handleChange}
    style={input}
    />

    <input
    name="pincode"
    placeholder="Pincode"
    value={form.pincode}
    onChange={handleChange}
    style={input}
    />

    <h3 style={{marginTop:"20px"}}>Payment Method</h3>

    <label style={{display:"block",marginTop:"10px"}}>

      <input
      type="radio"
      name="payment"
      value="COD"
      checked={form.payment==="COD"}
      onChange={handleChange}
      />

      Cash on Delivery

    </label>

    <label style={{display:"block",marginTop:"10px"}}>

      <input
      type="radio"
      name="payment"
      value="ONLINE"
      checked={form.payment==="ONLINE"}
      onChange={handleChange}
      />

      Pay Online

    </label>

  </div>


  {/* ORDER SUMMARY */}

  <div
  style={{
    border:"1px solid #eee",
    padding:"20px",
    borderRadius:"10px",
    background:"#fff",
    height:"fit-content"
  }}
  >

    <h3 style={{marginBottom:"20px"}}>Order Summary</h3>

    {cart.map(item=>(
      <div
      key={item._id}
      style={{
        display:"flex",
        justifyContent:"space-between",
        marginBottom:"10px"
      }}
      >

        <span>
          {item.name} × {item.quantity}
        </span>

        <span>
          ₹{item.price * item.quantity}
        </span>

      </div>
    ))}

    <hr style={{margin:"15px 0"}}/>

    <h3>Total: ₹{total}</h3>

    <button
    onClick={placeOrder}
    style={{
      width:"100%",
      marginTop:"20px",
      padding:"12px",
      border:"none",
      background:"#c28b45",
      color:"#fff",
      borderRadius:"6px",
      fontSize:"16px",
      cursor:"pointer"
    }}
    >

      Place Order

    </button>

  </div>

</div>
```

)

}

const input = {
width:"100%",
padding:"10px",
marginBottom:"10px",
border:"1px solid #ccc",
borderRadius:"6px"
}
