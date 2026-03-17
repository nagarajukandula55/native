"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateWarehouse() {

  const router = useRouter()

  const [form, setForm] = useState({
    warehouseCode: "",
    warehouseName: "",
    city: "",
    state: "",
    pincode: "",
    address: ""
  })

  const save = async () => {

    await fetch("/api/admin/warehouse/create", {
      method: "POST",
      body: JSON.stringify(form)
    })

    router.push("/admin/warehouses")
  }

  return (
    <div style={{ maxWidth: 500 }}>

      <h1>Create Warehouse</h1>

      <input style={input} placeholder="Code"
        onChange={e => setForm({...form, warehouseCode: e.target.value})}
      />

      <input style={input} placeholder="Name"
        onChange={e => setForm({...form, warehouseName: e.target.value})}
      />

      <input style={input} placeholder="City"
        onChange={e => setForm({...form, city: e.target.value})}
      />

      <input style={input} placeholder="State"
        onChange={e => setForm({...form, state: e.target.value})}
      />

      <input style={input} placeholder="Pincode"
        onChange={e => setForm({...form, pincode: e.target.value})}
      />

      <textarea style={input} placeholder="Address"
        onChange={e => setForm({...form, address: e.target.value})}
      />

      <button style={btn} onClick={save}>
        Save Warehouse
      </button>

    </div>
  )
}

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10
}

const btn = {
  padding: "10px 20px",
  background: "#111",
  color: "#fff",
  border: "none"
}
