"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useCart } from "@/context/CartContext"

export default function ProductPage(){

const { slug } = useParams()
const { addToCart } = useCart()

const [product,setProduct] = useState(null)
const [loading,setLoading] = useState(true)

useEffect(()=>{

const fetchProduct = async()=>{

try{

const res = await fetch("/api/admin/products")
const data = await res.json()

const found = data.find(p => p.slug === slug)

setProduct(found)

}catch(err){
console.log(err)
}
finally{
setLoading(false)
}

}

fetchProduct()

},[slug])

if(loading){
return <p style={{textAlign:"center",padding:"80px"}}>Loading...</p>
}

if(!product){
return <p style={{textAlign:"center",padding:"80px"}}>Product not found</p>
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
gridTemplateColumns:"repeat(auto-fit,minmax(350px,1fr))",
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
borderRadius:"12px"
}}
/>

</div>


{/* PRODUCT INFO */}

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
color:"#c28b45",
fontSize:"26px",
marginBottom:"20px"
}}
>
₹{product.price}
</p>

<p
style={{
lineHeight:"1.8",
marginBottom:"30px"
}}
>
{product.description || "Authentic natural product made from traditional ingredients."}
</p>

<button
onClick={()=>{
addToCart(product)
window.dispatchEvent(new Event("cart-open"))
}}
style={{
padding:"14px 35px",
borderRadius:"30px",
border:"none",
background:"#c28b45",
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
