"use client";

import { useState } from "react";

export default function ProductsAdmin(){

const [name,setName]=useState("");
const [price,setPrice]=useState("");
const [description,setDescription]=useState("");
const [imageFile,setImageFile]=useState(null);
const [preview,setPreview]=useState(null);

const handleImage=(e)=>{

const file=e.target.files[0];

if(file){
setImageFile(file);
setPreview(URL.createObjectURL(file));
}

}

const handleSubmit=async(e)=>{

e.preventDefault();

let imageUrl="";

if(imageFile){

const formData=new FormData();
formData.append("file",imageFile);

const upload=await fetch("/api/upload",{
method:"POST",
body:formData
});

const data=await upload.json();
imageUrl=data.url;

}

await fetch("/api/products",{

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

alert("Product added");

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
width="200"
/>

)}

<br/><br/>

<button type="submit">

Add Product

</button>

</form>

</div>

)

}
