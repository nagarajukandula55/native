"use client"

import { useState, useEffect } from "react"

export default function WarehousePage(){

  const [name,setName] = useState("")
  const [location,setLocation] = useState("")
  const [warehouses,setWarehouses] = useState([])
  const [loading,setLoading] = useState(false)

  useEffect(()=>{
    loadWarehouses()
  },[])

  async function loadWarehouses(){

    try{

      const res = await fetch("/api/admin/warehouse/list")
      const data = await res.json()

      if(data.success){
        setWarehouses(data.warehouses)
      }

    }catch{
      alert("Failed to load warehouses")
    }

  }

  async function saveWarehouse(e){

    e.preventDefault()

    if(!name){
      alert("Enter warehouse name")
      return
    }

    setLoading(true)

    try{

      const res = await fetch("/api/admin/warehouse/create",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          name,
          location
        })
      })

      const data = await res.json()

      if(data.success){

        alert("✅ Warehouse Added")

        setName("")
        setLocation("")

        loadWarehouses()

      }else{
        alert(data.message)
      }

    }catch(err){
      alert("Server error")
      console.log(err)
    }

    setLoading(false)
  }

  return(

    <div style={{maxWidth:900,margin:"auto"}}>

      <h1>Warehouse Manager</h1>

      <form
        onSubmit={saveWarehouse}
        style={{
          border:"1px solid #ddd",
          padding:20,
          borderRadius:8,
          marginTop:20,
          display:"grid",
          gap:10
        }}
      >

        <input
          placeholder="Warehouse Name"
          value={name}
          onChange={e=>setName(e.target.value)}
        />

        <input
          placeholder="Location"
          value={location}
          onChange={e=>setLocation(e.target.value)}
        />

        <button
          disabled={loading}
          style={{
            padding:10,
            background:"black",
            color:"#fff",
            cursor:"pointer"
          }}
        >
          {loading ? "Saving..." : "Add Warehouse"}
        </button>

      </form>

      <h2 style={{marginTop:40}}>
        All Warehouses ({warehouses.length})
      </h2>

      <table
        style={{
          width:"100%",
          marginTop:10,
          borderCollapse:"collapse"
        }}
      >

        <thead>
          <tr style={{background:"#f5f5f5"}}>
            <th>Name</th>
            <th>Location</th>
          </tr>
        </thead>

        <tbody>

          {warehouses.map(w=>(
            <tr key={w._id} style={{borderBottom:"1px solid #eee"}}>
              <td>{w.name}</td>
              <td>{w.location}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  )
}
