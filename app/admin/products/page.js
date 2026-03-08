"use client";

import { useState, useEffect } from "react";

export default function ProductsAdmin() {

const [products,setProducts]=useState([]);

const [name,setName]=useState("");
const [price,setPrice]=useState("");
const [description,setDescription]=useState("");

const [imageFile,setImageFile]=useState(null);
const [preview,setPreview]=useState(null);


// LOAD PRODUCTS
useEffect(()=>{

loadProducts();

},[])


async function loadProducts(){

try{

const res=await fetch("/api/admin/products");

const data=await res.json();

setProducts(data.products || []);

}catch(err){

console.error("Failed to load products",err);

}

}


// IMAGE PREVIEW
function handleImage(e){

const file=e.target.files[0];

if(file){

setImageFile(file);

setPreview(URL.createObjectURL(file));

}

}


// ADD PRODUCT
async function handleSubmit(e){

e.preventDefault();

let imageUrl="";

try{

// UPLOAD IMAGE
if(imageFile){

const formData=new FormData();

formData.append("file",imageFile);

const upload=await fetch("/api/upload",{

method:"POST",
body:formData

});

const uploadData=await upload.json();

imageUrl=uploadData.url;

}


// SAVE PRODUCT
await fetch("/api/admin/products",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

name,
price,
description,
image:imageUrl

})

});


// RESET FORM
setName("");
setPrice("");
setDescription("");
setImageFile(null);
setPreview(null);


// RELOAD PRODUCTS
loadProducts();

alert("Product added");

}catch(err){

console.error("Product upload error",err);

}

}


return(

<div style={{padding:"40px"}}>

<h2>Add Product</h2>

<form onSubmit={handleSubmit}>

<input
placeholder="Product Name"
value={name}
onChange={(e)=>setName(e.target.value)}
required
/>

<br/><br/>

<input
type="number"
placeholder="Price"
value={price}
onChange={(e)=>setPrice(e.target.value)}
required
/>

<br/><br/>

<textarea
placeholder="Description"
value={description}
onChange={(e)=>setDescription(e.target.value)}
/>

<br/><br/>

<input
type="file"
accept="image/*"
onChange={handleImage}
/>

<br/><br/>

{preview && (

<img
src={preview}
width="150"
style={{borderRadius:"10px"}}
/>

)}

<br/><br/>

<button type="submit">

Add Product

</button>

</form>


<hr style={{margin:"40px 0"}}/>


<h2>Products</h2>


{Array.isArray(products) && products.length === 0 && (

<p>No products found</p>

)}


{Array.isArray(products) && products.map((p)=> (

<div key={p.id} style={{marginBottom:"25px"}}>

{p.image && (

<img
src={p.image}
width="120"
style={{borderRadius:"8px"}}
/>

)}

<h4>{p.name}</h4>

<p>₹{p.price}</p>

<p>{p.description}</p>

</div>

))}


</div>

)

}
