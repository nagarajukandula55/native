"use client"

import { useEffect, useState } from "react"

export default function Warehouses(){

  const [data,setData] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    load()
  },[])

  async function load(){

    try{

      const res = await fetch("/api/admin/warehouses/list")
      const json = await res.json()

      if(json.success)
        setData(json.warehouses)

    }catch{
      alert("Failed to load warehouses")
    }

    setLoading(false)
  }

  async function toggleStatus(id,current){

    await fetch("/api/admin/warehouses/toggle",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        id,
        value: !current
      })
    })

    load()
  }

  if(loading)
    return <h2>Loading Warehouses...</h2>

  return(

    <div style={{maxWidth:1300,margin:"auto"}}>

      <h1 style={{fontSize:28,fontWeight:"bold"}}>
        🏭 Warehouses Management
      </h1>

      <table
        style={{
          width:"100%",
          marginTop:20,
          borderCollapse:"collapse"
        }}
      >

        <thead>
          <tr style={{background:"#f5f5f5"}}>
            <th>Code</th>
            <th>Name</th>
            <th>Type</th>
            <th>City</th>
            <th>Manager</th>
            <th>Dispatch</th>
            <th>Purchase</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {data.map(w=>(
            <tr key={w._id} style={{borderBottom:"1px solid #eee"}}>

              <td>{w.code}</td>
              <td>{w.name}</td>
              <td>{w.type}</td>
              <td>{w.city}</td>
              <td>{w.managerName}</td>

              <td>{w.allowDispatch ? "Yes" : "No"}</td>
              <td>{w.allowPurchase ? "Yes" : "No"}</td>

              <td>
                <button
                  onClick={()=>toggleStatus(w._id,w.isActive)}
                  style={{
                    background:w.isActive ? "green":"red",
                    color:"#fff",
                    padding:"5px 12px",
                    borderRadius:5
                  }}
                >
                  {w.isActive ? "Active" : "Disabled"}
                </button>
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  )
}
