"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useCart } from "@/context/CartContext"

export default function ProductPage(){

const { addToCart } = useCart()

const params = useParams()
const slug = params.slug

const [product,setProduct] = useState(null)
const [loading,setLoading] = useState(true)
const [qty,setQty] = useState(1)

useEffect(()=>{

const fetchProduct = async()=>{

try{

const res = await fetch(`/api/products/${slug}`)
const data = await res.json()

if(data.success){
setProduct(data.product)
}

}catch(err){
console.log(err)
}
finally{
setLoading(false)
}

}

fetchProduct()

},[slug])


function handleAdd(){

for(let i=0;i<qty;i++){
addToCart(product)
}

alert("Product added to cart")

}


if(loading){
return <p style={{textAlign:"center",padding:"100px"}}>Loading...</p>
}

if(!product){
return <p style={{textAlign:"center",padding:"100px"}}>Product not found</p>
}


return(

<div
style={{
maxWidth:"1200px",
margin:"auto",
padding:"60px 20px"
}}
>


<div
style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"50px",
alignItems:"center"
}}
>


{/* PRODUCT IMAGE */}

<div>

<img
src={product.image}
alt={product.name}
style={{
width:"100%",
borderRadius:"10px"
}}
/>

</div>



{/* PRODUCT DETAILS */}

<div>

<h1
style={{
fontSize:"36px",
marginBottom:"10px"
}}
>
{product.name}
</h1>


<p
style={{
fontSize:"24px",
color:"#c28b45",
marginBottom:"20px"
}}
>
₹{product.price}
</p>


<p
style={{
lineHeight:"1.7",
marginBottom:"30px",
color:"#555"
}}
>
{product.description || "Healthy natural product sourced traditionally."}
</p>


{/* QUANTITY */}

<div
style={{
display:"flex",
alignItems:"center",
gap:"10px",
marginBottom:"25px"
}}
>

<button
onClick={()=>setQty(Math.max(1,qty-1))}
style={{
padding:"6px 12px",
fontSize:"18px"
}}
>
-
</button>

<span>{qty}</span>

<button
onClick={()=>setQty(qty+1)}
style={{
padding:"6px 12px",
fontSize:"18px"
}}
>
+
</button>

</div>


{/* ADD TO CART */}

<button
onClick={handleAdd}
style={{
padding:"14px 35px",
background:"#c28b45",
border:"none",
borderRadius:"30px",
color:"#fff",
fontSize:"16px",
cursor:"pointer"
}}
>

Add to Cart

</button>

</div>

</div>

</div>

)

}
