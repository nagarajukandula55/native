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
background:"linear-gradient(to bottom,#f4efe6,#faf8f3)"
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
fontSize:"22px",
marginBottom:"20px",
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



{/* CATEGORY SECTION */}

<section
style={{
padding:"70px 20px",
maxWidth:"1200px",
margin:"auto",
textAlign:"center"
}}
>

<h2 style={{fontSize:"36px",marginBottom:"40px"}}>

Our Categories

</h2>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:"25px"
}}
>

<div style={categoryCard}>Batter Mix</div>
<div style={categoryCard}>Cold Pressed Oils</div>
<div style={categoryCard}>Traditional Foods</div>
<div style={categoryCard}>Natural Products</div>

</div>

</section>



{/* FEATURED PRODUCTS */}

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
Featured Products
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
borderRadius:"12px",
padding:"20px",
textAlign:"center",
background:"#fff",
boxShadow:"0 5px 15px rgba(0,0,0,0.05)"
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



{/* WHY NATIVE */}

<section
style={{
background:"#f4efe6",
padding:"70px 20px",
textAlign:"center"
}}
>

<h2 style={{fontSize:"36px",marginBottom:"40px"}}>

Why Choose Native

</h2>

<div
style={{
maxWidth:"1000px",
margin:"auto",
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
gap:"30px"
}}
>

<div style={featureCard}>
🌿 <br/> 100% Natural
</div>

<div style={featureCard}>
🚜 <br/> Direct From Farmers
</div>

<div style={featureCard}>
🧂 <br/> Traditional Methods
</div>

<div style={featureCard}>
❤️ <br/> Healthy Lifestyle
</div>

</div>

</section>


</div>

)
}


/* STYLES */

const categoryCard = {
background:"#fff",
padding:"40px 20px",
borderRadius:"10px",
fontSize:"18px",
fontWeight:"500",
boxShadow:"0 5px 15px rgba(0,0,0,0.05)"
}

const featureCard = {
background:"#fff",
padding:"30px",
borderRadius:"10px",
fontSize:"18px",
boxShadow:"0 5px 15px rgba(0,0,0,0.05)"
}
