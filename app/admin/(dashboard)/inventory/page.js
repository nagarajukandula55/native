"use client"

import { useEffect, useState } from "react"

export default function InventoryPanel(){

  const [skus,setSkus] = useState([])
  const [warehouses,setWarehouses] = useState([])
  const [form,setForm] = useState({
    skuId:"",
    warehouseId:"",
    qty:""
  })

  useEffect(()=>{
    loadData()
  },[])

  async function loadData(){

    const s = await fetch("/api/admin/sku/list")
    const skuData = await s.json()

    const w = await fetch("/api/admin/warehouse/list")
    const whData = await w.json()

    setSkus(skuData)
    setWarehouses(whData)
  }

  async function addStock(){

    if(!form.skuId || !form.warehouseId || !form.qty){
      alert("Fill all fields")
      return
    }

    const res = await fetch("/api/admin/inventory/add",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify(form)
    })

    const data = await res.json()

    if(data.success)
      alert("Stock Added")
    else
      alert(data.message)
  }

  return(

    <div style={{maxWidth:600}}>

      <h1>Inventory Stock Panel</h1>

      <select
        onChange={e =>
          setForm({...form,skuId:e.target.value})
        }
      >
        <option value="">Select SKU</option>
        {skus.map(s=>(
          <option key={s._id} value={s._id}>
            {s.skuCode}
          </option>
        ))}
      </select>

      <br/><br/>

      <select
        onChange={e =>
          setForm({...form,warehouseId:e.target.value})
        }
      >
        <option value="">Select Warehouse</option>
        {warehouses.map(w=>(
          <option key={w._id} value={w._id}>
            {w.name}
          </option>
        ))}
      </select>

      <br/><br/>

      <input
        type="number"
        placeholder="Quantity"
        onChange={e =>
          setForm({...form,qty:e.target.value})
        }
      />

      <br/><br/>

      <button onClick={addStock}>
        Add Stock
      </button>

    </div>
  )
}
