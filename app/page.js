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

        const res = await fetch("/api/products")
        const data = await res.json()

        if(data.success){
          setProducts(data.products)
        }

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
className="brand-font"
style={{
fontSize:"clamp(42px,6vw,72px)",
color:"#3a2a1c",
marginBottom:"20px"
}}
>

Welcome to Native

</h1>

<p
style={{
fontSize:"18px",
lineHeight:"1.8",
marginBottom:"30px",
color:"#5c4634"
}}
>

Eat Healthy, Stay Healthy.  
Authentic natural products refined directly from the source.

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
className="brand-font"
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
onClick={()=>addToCart(product)}
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
