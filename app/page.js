"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/context/CartContext"

export default function Home() {

  const { addToCart } = useCart()

  const [products,setProducts] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{

    const fetchProducts = async()=>{

      try{

        const res = await fetch("/api/admin/products")
        const data = await res.json()

        // API returns array
        setProducts(data)

      }catch(err){
        console.log(err)
      }
      finally{
        setLoading(false)
      }

    }

    fetchProducts()

  },[])



  return(

    <div>

{/* HERO SECTION */}

<section
style={{
minHeight:"85vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
textAlign:"center",
padding:"40px 20px",
background:"#f4efe6"
}}
>

<div style={{maxWidth:"800px"}}>

<h1
style={{
fontSize:"clamp(48px,7vw,80px)",
color:"#3a2a1c",
marginBottom:"10px",
fontFamily:"Cinzel, serif",
fontWeight:"600"
}}
>
Welcome to Native
</h1>

<p
style={{
fontSize:"20px",
marginBottom:"25px",
color:"#5c4634"
}}
>
Eat Healthy, Stay Healthy
</p>

<p
style={{
fontSize:"18px",
lineHeight:"1.8",
marginBottom:"30px",
color:"#5c4634"
}}
>
Authentic natural food products refined directly from the source.
Pure, traditional and healthy for everyday life.
</p>

<button
onClick={()=>document.getElementById("products").scrollIntoView({behavior:"smooth"})}
style={{
padding:"14px 40px",
borderRadius:"40px",
border:"none",
background:"#c28b45",
color:"#fff",
fontSize:"16px",
cursor:"pointer"
}}
>

Explore Products

</button>

</div>

</section>



{/* PRODUCTS */}

<section
id="products"
style={{
padding:"70px 20px",
maxWidth:"1200px",
margin:"auto"
}}
>

<h2
style={{
textAlign:"center",
fontSize:"36px",
marginBottom:"50px"
}}
>

Our Products

</h2>


{loading ?

<p style={{textAlign:"center"}}>Loading products...</p>

:

products.length === 0 ?

<p style={{textAlign:"center"}}>No products available</p>

:

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
gap:"30px"
}}
>

{products.map((product)=>(

<div
key={product._id}
style={{
border:"1px solid #eee",
borderRadius:"10px",
padding:"20px",
textAlign:"center",
background:"#fff"
}}
>

<img
src={product.image}
alt={product.name}
style={{
width:"100%",
height:"220px",
objectFit:"cover",
borderRadius:"8px"
}}
/>

<h3 style={{marginTop:"15px"}}>
{product.name}
</h3>

<p
style={{
color:"#c28b45",
fontSize:"18px",
margin:"10px 0"
}}
>
₹{product.price}
</p>

<button
onClick={()=>{
addToCart(product)
window.dispatchEvent(new Event("cart-open"))
}}
style={{
padding:"10px 20px",
borderRadius:"25px",
border:"none",
background:"#c28b45",
color:"#fff",
cursor:"pointer"
}}
>
Add to Cart
</button>

</div>

))}

</div>

}

</section>

</div>

  )

}
