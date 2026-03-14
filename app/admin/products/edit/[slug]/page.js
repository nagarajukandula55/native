"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function EditProduct(){

  const { slug } = useParams()
  const router = useRouter()

  const [form,setForm] = useState(null)
  const [loading,setLoading] = useState(true)
  const [saving,setSaving] = useState(false)
  const [uploading,setUploading] = useState(false)

  useEffect(()=>{
    loadProduct()
  },[])

  async function loadProduct(){

    const res = await fetch("/api/admin/products/"+slug)
    const data = await res.json()

    setForm(data)

    setLoading(false)
  }

  function handleChange(e){

    const {name,value,type,checked} = e.target

    setForm(prev=>({
      ...prev,
      [name]: type==="checkbox" ? checked : value
    }))
  }

  async function handleImageUpload(e){

    const file = e.target.files[0]
    if(!file) return

    setUploading(true)

    const fd = new FormData()
    fd.append("file",file)

    const res = await fetch("/api/upload",{
      method:"POST",
      body:fd
    })

    const data = await res.json()

    setForm(prev=>({
      ...prev,
      image:data.url
    }))

    setUploading(false)
  }

  async function handleSubmit(e){

    e.preventDefault()

    setSaving(true)

    await fetch("/api/admin/products/"+slug,{
      method:"PUT",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify(form)
    })

    setSaving(false)

    alert("✅ Product Updated")

    router.push("/admin/products")
  }

  if(loading){
    return <h2 style={{padding:40}}>Loading product...</h2>
  }

  return(

    <div style={{
      maxWidth:800,
      margin:"auto",
      padding:30
    }}>

      <h1 style={{fontSize:28,fontWeight:"bold"}}>
        ✏️ Edit Product
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          marginTop:20,
          display:"grid",
          gap:10
        }}
      >

        <input name="name"
          value={form.name}
          onChange={handleChange}
          required />

        <input name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          required />

        <input name="category"
          value={form.category}
          onChange={handleChange} />

        <input name="stock"
          type="number"
          value={form.stock}
          onChange={handleChange} />

        <textarea name="description"
          value={form.description}
          onChange={handleChange} />

        <input type="file" onChange={handleImageUpload} />

        {uploading && <p>Uploading...</p>}

        {form.image && (
          <img
            src={form.image}
            style={{
              width:100,
              height:100,
              objectFit:"cover"
            }}
          />
        )}

        <label>
          <input
            type="checkbox"
            name="featured"
            checked={form.featured}
            onChange={handleChange}
          />
          Featured Product
        </label>

        <button
          disabled={saving}
          style={{
            padding:12,
            background:"black",
            color:"#fff",
            borderRadius:6
          }}
        >
          {saving ? "Updating..." : "Update Product"}
        </button>

      </form>

    </div>

  )

}
