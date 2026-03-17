"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateSKU(){

  const router = useRouter()
  const [products,setProducts] = useState([])
  const [warehouses,setWarehouses] = useState([])
  const [form,setForm] = useState({ skuCode:"", partCode:"", price:"", product:"", warehouse:"" })
  const [saving,setSaving] = useState(false)

  useEffect(()=>{
    fetch("/api/admin/products").then(r=>r.json()).then(d=>setProducts(d.success?d.products:d))
    fetch("/api/admin/warehouse/list").then(r=>r.json()).then(d=>setWarehouses(d.success?d.warehouses:d))
  },[])

  function change(e){
    const {name,value} = e.target
    setForm(prev=>({ ...prev, [name]:value }))
  }

  async function save(e){
    e.preventDefault()
    if(!form.skuCode || !form.product || !form.warehouse || !form.price){
      alert("SKU, Product, Warehouse & Price are required")
      return
    }
    setSaving(true)
    await fetch("/api/admin/skus/create",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(form)
    })
    alert("SKU Created Successfully")
    router.push("/admin/skus")
  }

  return(
    <div style={{ maxWidth:700, margin:"auto" }}>
      <h1 style={{ fontSize:26, fontWeight:"bold" }}>Create SKU</h1>

      <form onSubmit={save} style={{ display:"grid", gap:12, marginTop:20 }}>
        <input name="skuCode" placeholder="SKU Code" value={form.skuCode} onChange={change} required/>
        <input name="partCode" placeholder="Part Code" value={form.partCode} onChange={change}/>
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={change} required/>

        <select name="product" value={form.product} onChange={change} required>
          <option value="">Select Product</option>
          {products.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}
        </select>

        <select name="warehouse" value={form.warehouse} onChange={change} required>
          <option value="">Select Warehouse</option>
          {warehouses.map(w=><option key={w._id} value={w._id}>{w.name} ({w.city})</option>)}
        </select>

        <button disabled={saving} style={{ padding:"12px 18px", background:"#111", color:"#fff", borderRadius:6 }}>
          {saving?"Saving...":"Create SKU"}
        </button>
      </form>
    </div>
  )
}
