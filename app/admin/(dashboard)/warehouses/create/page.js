"use client"

import { useEffect, useState } from "react"

export default function WarehousePage(){

  const emptyForm = {
    name:"",
    code:"",
    type:"Main",
    address:"",
    city:"",
    state:"",
    pincode:"",
    country:"India",
    managerName:"",
    phone:"",
    email:"",
    capacity:"",
    isActive:true,
    allowDispatch:true,
    allowPurchase:true,
    priority:1
  }

  const [form,setForm] = useState(emptyForm)
  const [warehouses,setWarehouses] = useState([])
  const [saving,setSaving] = useState(false)

  useEffect(()=>{
    loadWarehouses()
  },[])

  async function loadWarehouses(){

    const res = await fetch("/api/admin/warehouses/list")
    const data = await res.json()

    if(data.success)
      setWarehouses(data.warehouses)
  }

  function handleChange(e){

    const {name,value,type,checked} = e.target

    setForm(prev=>({
      ...prev,
      [name]: type==="checkbox" ? checked : value
    }))
  }

  async function save(e){

    e.preventDefault()

    if(!form.name || !form.code){
      alert("Name & Code required")
      return
    }

    setSaving(true)

    const res = await fetch("/api/admin/warehouses/create",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(form)
    })

    const data = await res.json()

    if(data.success){

      alert("✅ Warehouse Created")

      setForm(emptyForm)

      loadWarehouses()
    }
    else{
      alert(data.message)
    }

    setSaving(false)
  }

  return(

    <div style={{maxWidth:1200,margin:"auto"}}>

      <h1 style={{fontSize:28,fontWeight:"bold"}}>
        🏭 Warehouses Master
      </h1>

      <form
        onSubmit={save}
        style={{
          marginTop:20,
          border:"1px solid #eee",
          borderRadius:10,
          padding:25,
          display:"grid",
          gap:15
        }}
      >

        <h3>Basic Info</h3>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <input name="name" placeholder="Warehouse Name"
            value={form.name} onChange={handleChange} />

          <input name="code" placeholder="Warehouse Code"
            value={form.code} onChange={handleChange} />
        </div>

        <select name="type" value={form.type} onChange={handleChange}>
          <option>Main</option>
          <option>Store</option>
          <option>Hub</option>
          <option>Vendor</option>
          <option>Dark Store</option>
        </select>

        <h3>Address</h3>

        <textarea name="address"
          placeholder="Full Address"
          value={form.address}
          onChange={handleChange}
        />

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <input name="city" placeholder="City"
            value={form.city} onChange={handleChange} />

          <input name="state" placeholder="State"
            value={form.state} onChange={handleChange} />

          <input name="pincode" placeholder="Pincode"
            value={form.pincode} onChange={handleChange} />
        </div>

        <h3>Contact</h3>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <input name="managerName" placeholder="Manager Name"
            value={form.managerName} onChange={handleChange} />

          <input name="phone" placeholder="Phone"
            value={form.phone} onChange={handleChange} />

          <input name="email" placeholder="Email"
            value={form.email} onChange={handleChange} />
        </div>

        <h3>Operations</h3>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <input name="capacity" type="number"
            placeholder="Storage Capacity"
            value={form.capacity}
            onChange={handleChange} />

          <input name="priority" type="number"
            placeholder="Priority"
            value={form.priority}
            onChange={handleChange} />
        </div>

        <label>
          <input type="checkbox" name="isActive"
            checked={form.isActive}
            onChange={handleChange} />
          Active Warehouse
        </label>

        <label>
          <input type="checkbox" name="allowDispatch"
            checked={form.allowDispatch}
            onChange={handleChange} />
          Allow Dispatch
        </label>

        <label>
          <input type="checkbox" name="allowPurchase"
            checked={form.allowPurchase}
            onChange={handleChange} />
          Allow Purchase Receive
        </label>

        <button
          disabled={saving}
          style={{
            padding:12,
            background:"black",
            color:"#fff",
            borderRadius:6,
            cursor:"pointer"
          }}
        >
          {saving ? "Saving..." : "Create Warehouse"}
        </button>

      </form>

      <h2 style={{marginTop:40}}>
        All Warehouses ({warehouses.length})
      </h2>

      <table style={{width:"100%",marginTop:10,borderCollapse:"collapse"}}>

        <thead>
          <tr style={{background:"#f5f5f5"}}>
            <th>Code</th>
            <th>Name</th>
            <th>City</th>
            <th>Manager</th>
            <th>Active</th>
          </tr>
        </thead>

        <tbody>
          {warehouses.map(w=>(
            <tr key={w._id} style={{borderBottom:"1px solid #eee"}}>
              <td>{w.code}</td>
              <td>{w.name}</td>
              <td>{w.city}</td>
              <td>{w.managerName}</td>
              <td>{w.isActive ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  )
}
