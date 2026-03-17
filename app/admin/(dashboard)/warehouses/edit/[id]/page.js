"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function EditWarehouse(){

  const { id } = useParams()
  const router = useRouter()

  const [form,setForm] = useState(null)

  useEffect(()=>{
    load()
  },[])

  async function load(){

    const res = await fetch("/api/admin/warehouses/get/"+id)
    const json = await res.json()

    if(json.success)
      setForm(json.warehouse)
    else
      alert("Failed to load warehouse")
  }

  function change(e){

    const {name,value,type,checked} = e.target

    setForm(prev=>({
      ...prev,
      [name]: type==="checkbox" ? checked : value
    }))
  }

  async function save(){

    await fetch("/api/admin/warehouses/update",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(form)
    })

    alert("Warehouse Updated")

    router.push("/admin/warehouses")
  }

  if(!form)
    return <h2>Loading...</h2>

  return(

    <div style={{maxWidth:900,margin:"auto"}}>

      <h1 style={{fontSize:26,fontWeight:"bold"}}>
        Edit Warehouse
      </h1>

      <div style={{
        display:"grid",
        gridTemplateColumns:"1fr 1fr",
        gap:12,
        marginTop:20
      }}>

        <input name="code" value={form.code} onChange={change}/>
        <input name="name" value={form.name} onChange={change}/>
        <input name="city" value={form.city} onChange={change}/>
        <input name="state" value={form.state} onChange={change}/>
        <input name="managerName" value={form.managerName} onChange={change}/>
        <input name="managerPhone" value={form.managerPhone} onChange={change}/>

        <label>
          <input
            type="checkbox"
            name="allowDispatch"
            checked={form.allowDispatch}
            onChange={change}
          />
          Allow Dispatch
        </label>

        <label>
          <input
            type="checkbox"
            name="allowPurchase"
            checked={form.allowPurchase}
            onChange={change}
          />
          Allow Purchase
        </label>

      </div>

      <button
        onClick={save}
        style={{
          marginTop:20,
          padding:"12px 18px",
          background:"#111",
          color:"#fff",
          borderRadius:8,
          cursor:"pointer"
        }}
      >
        Save Changes
      </button>

    </div>
  )
}
