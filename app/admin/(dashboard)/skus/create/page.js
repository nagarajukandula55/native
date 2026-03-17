"use client"

import { useEffect, useState } from "react"

export default function CreateSKU(){

  const [products,setProducts] = useState([])
  const [form,setForm] = useState({
    productId:"",
    skuCode:"",
    partCode:"",
    price:""
  })

  useEffect(()=>{
    loadProducts()
  },[])

  async function loadProducts(){

    try{
      const res = await fetch("/api/admin/products")
      const data = await res.json()

      if(Array.isArray(data))
        setProducts(data)
      else if(data.success)
        setProducts(data.products)
      else
        setProducts([])

    }catch{
      alert("Product load failed")
    }
  }

  async function save(){

    if(!form.productId)
      return alert("Select Product")

    if(!form.skuCode)
      return alert("Enter SKU Code")

    if(!form.partCode)
      return alert("Enter Part Code")

    const res = await fetch("/api/admin/sku/create",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify(form)
    })

    const data = await res.json()

    if(data.success)
      alert("SKU Created")
    else
      alert(data.message)
  }

  return(

    <div style={{maxWidth:600}}>

      <h1>Create SKU</h1>

      <select
        value={form.productId}
        onChange={e =>
          setForm({...form,productId:e.target.value})
        }
      >
        <option value="">Select Product</option>

        {products.map(p=>(
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}

      </select>

      <br/><br/>

      <input
        placeholder="SKU Code"
        value={form.skuCode}
        onChange={e =>
          setForm({...form,skuCode:e.target.value})
        }
      />

      <br/><br/>

      <input
        placeholder="Part Code"
        value={form.partCode}
        onChange={e =>
          setForm({...form,partCode:e.target.value})
        }
      />

      <br/><br/>

      <input
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={e =>
          setForm({...form,price:e.target.value})
        }
      />

      <br/><br/>

      <button onClick={save}>
        Save SKU
      </button>

    </div>
  )
}
