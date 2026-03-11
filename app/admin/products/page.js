"use client";

import { useState, useEffect } from "react";

export default function AdminProductsPage() {

  const [products,setProducts] = useState([]);
  const [editingId,setEditingId] = useState(null);
  const [loading,setLoading] = useState(false);

  const [form,setForm] = useState({
    name:"",
    price:"",
    description:"",
    stock:100,
    category:"General",
    featured:false,
    image:"",
    imageFile:null
  });

  const [preview,setPreview] = useState(null);

  // ---------------------------
  // LOAD PRODUCTS
  // ---------------------------
  const loadProducts = async () => {

    try{

      const res = await fetch("/api/admin/products");
      const data = await res.json();

      console.log("Products:",data);

      setProducts(data.products || []);

    }catch(err){

      console.error("Load products error:",err);

    }

  };

  useEffect(()=>{
    loadProducts();
  },[]);


  // ---------------------------
  // HANDLE INPUT CHANGE
  // ---------------------------
  const handleChange = (e) => {

    const {name,value,type,checked} = e.target;

    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

  };


  // ---------------------------
  // IMAGE SELECT
  // ---------------------------
  const handleImage = (e) => {

    const file = e.target.files[0];

    if(!file) return;

    setForm(prev => ({
      ...prev,
      imageFile:file
    }));

    setPreview(URL.createObjectURL(file));

  };


  // ---------------------------
  // IMAGE UPLOAD
  // ---------------------------
  const uploadImage = async (file) => {

    const formData = new FormData();

    formData.append("file",file);

    const res = await fetch("/api/upload",{
      method:"POST",
      body:formData
    });

    const data = await res.json();

    console.log("Upload response:",data);

    if(!data.success){
      throw new Error("Image upload failed");
    }

    return data.url;

  };


  // ---------------------------
  // SUBMIT PRODUCT
  // ---------------------------
  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try{

      let imageUrl = form.image || "";

      if(form.imageFile){

        imageUrl = await uploadImage(form.imageFile);

      }

      const payload = {
        name:form.name,
        price:Number(form.price),
        description:form.description,
        stock:Number(form.stock),
        category:form.category,
        featured:form.featured,
        image:imageUrl
      };

      console.log("Payload:",payload);

      const method = editingId ? "PATCH" : "POST";

      const res = await fetch("/api/admin/products",{

        method,

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify(
          editingId ? {...payload,id:editingId} : payload
        )

      });

      const data = await res.json();

      console.log("API response:",data);

      if(!data.success){

        throw new Error(data.message || "Save failed");

      }

      alert(editingId ? "Product updated" : "Product added");

      // RESET
      setForm({
        name:"",
        price:"",
        description:"",
        stock:100,
        category:"General",
        featured:false,
        image:"",
        imageFile:null
      });

      setPreview(null);
      setEditingId(null);

      loadProducts();

    }catch(err){

      console.error("Error saving product:",err);

      alert("Error saving product. See console.");

    }

    setLoading(false);

  };


  // ---------------------------
  // EDIT PRODUCT
  // ---------------------------
  const startEdit = (product) => {

    setEditingId(product.id);

    setForm({
      name:product.name,
      price:product.price,
      description:product.description || "",
      stock:product.stock || 100,
      category:product.category || "General",
      featured:product.featured || false,
      image:product.image || "",
      imageFile:null
    });

    setPreview(product.image || null);

  };


  // ---------------------------
  // DELETE PRODUCT
  // ---------------------------
  const deleteProduct = async (id) => {

    if(!confirm("Delete product?")) return;

    const res = await fetch("/api/admin/products",{

      method:"DELETE",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({id})

    });

    const data = await res.json();

    if(data.success){

      alert("Deleted");

      loadProducts();

    }

  };


  // ---------------------------
  // UI
  // ---------------------------
  return (

    <div style={{padding:"40px"}}>

      <h2>{editingId ? "Edit Product" : "Add Product"}</h2>

      <form onSubmit={handleSubmit} style={{maxWidth:"500px"}}>

        <input
        name="name"
        placeholder="Product name"
        value={form.name}
        onChange={handleChange}
        required
        />

        <br/><br/>

        <input
        name="price"
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={handleChange}
        required
        />

        <br/><br/>

        <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        />

        <br/><br/>

        <input
        name="stock"
        type="number"
        value={form.stock}
        onChange={handleChange}
        />

        <br/><br/>

        <input
        name="category"
        value={form.category}
        onChange={handleChange}
        />

        <br/><br/>

        <label>

        <input
        type="checkbox"
        name="featured"
        checked={form.featured}
        onChange={handleChange}
        />

        Featured

        </label>

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
          alt="preview"
          />

        )}

        <br/><br/>

        <button disabled={loading}>

          {loading ? "Saving..." : editingId ? "Update Product" : "Add Product"}

        </button>

      </form>

      <hr style={{margin:"40px 0"}}/>

      <h2>Products</h2>

      {products.map(p => (

        <div key={p.id} style={{border:"1px solid #ccc",padding:"15px",marginBottom:"20px"}}>

          {p.image && (

            <img src={p.image} width="120"/>

          )}

          <h4>{p.name}</h4>

          <p>₹{p.price}</p>

          <button onClick={()=>startEdit(p)}>Edit</button>

          <button onClick={()=>deleteProduct(p.id)}>Delete</button>

        </div>

      ))}

    </div>

  );

}
