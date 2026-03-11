"use client"

import { useEffect,useState } from "react"
import { useParams } from "next/navigation"
import { useCart } from "@/context/CartContext"

export default function ProductPage(){

const { slug } = useParams()
const { addToCart } = useCart()

const [product,setProduct] = useState(null)

useEffect(()=>{

const fetchProduct = async()=>{

const res = await fetch(`/api/products/${slug}`)
const data = await res.json()

if(data.success){
setProduct(data.product)
}

}

fetchProduct()

},[slug])


if(!product){
return <p style={{padding:"80px"}}>Loading...</p>
}


return(

<div
style={{
maxWidth:"1200px",
margin:"auto",
padding:"80px 20px",
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"50px"
}}
>

<img
src={product.image}
style={{
width:"100%",
borderRadius:"10px"
}}
/>

<div>

<h1
style={{
fontSize:"40px",
marginBottom:"20px"
}}
>
{product.name}
</h1>

<p
style={{
fontSize:"18px",
marginBottom:"20px"
}}
>
{product.description}
</p>

<h2
style={{
color:"#c28b45",
marginBottom:"20px"
}}
>
₹{product.price}
</h2>

<button
onClick={()=>addToCart(product)}
style={{
padding:"12px 30px",
borderRadius:"30px",
border:"none",
background:"#c28b45",
color:"#fff",
cursor:"pointer"
}}
>
Add to Cart
</button>

</div>

</div>

)

}
