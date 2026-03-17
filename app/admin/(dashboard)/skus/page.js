"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function SKUs(){

  const [skus,setSkus] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{ load() },[])

  async function load(){
    try{
      const res = await fetch("/api/admin/skus/list")
      const json = await res.json()
      if(json.success) setSkus(json.skus)
    }catch{
      alert("Failed to load SKUs")
    }
    setLoading(false)
  }

  async function toggle(id,current){
    await fetch("/api/admin/skus/toggle",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, value: !current })
    })
    load()
  }

  if(loading) return <h2>Loading SKUs...</h2>

  return(
    <div style={{ maxWidth:1300, margin:"auto" }}>
      <h1 style={{fontSize:28,fontWeight:"bold"}}>🗂 SKU Management</h1>

      <Link href="/admin/skus/create">
        <button style={{ margin:"20px 0", padding:"10px 16px", background:"#111", color:"#fff", borderRadius:6 }}>+ Create SKU</button>
      </Link>

      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:"#f5f5f5" }}>
            <th>SKU Code</th>
            <th>Part Code</th>
            <th>Product</th>
            <th>Warehouse</th>
            <th>Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {skus.map(s=>(
            <tr key={s._id} style={{ borderBottom:"1px solid #eee" }}>
              <td>{s.skuCode}</td>
              <td>{s.partCode || "-"}</td>
              <td>{s.product?.name}</td>
              <td>{s.warehouse?.name}</td>
              <td>₹{s.price}</td>
              <td>
                <button onClick={()=>toggle(s._id,s.isActive)}
                  style={{ background:s.isActive?"green":"red", color:"#fff", padding:"5px 12px", borderRadius:5 }}
                >
                  {s.isActive ? "Active":"Disabled"}
                </button>
              </td>
              <td>
                <Link href={`/admin/skus/edit/${s._id}`}>
                  <button style={{ padding:"6px 12px", background:"#0a7cff", color:"#fff", borderRadius:4 }}>Edit</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
