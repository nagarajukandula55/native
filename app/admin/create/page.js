"use client"

import { useState } from "react"
import { registerAdmin } from "@/lib/an-sdk/users"

export default function CreateAdmin(){

  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [msg,setMsg] = useState("")

  async function create(){

    try {
      const data = await registerAdmin({ name, email, password })

      if(data.success){
        setMsg("✅ Admin Created Successfully")
      }else{
        setMsg("❌ Failed")
      }
    } catch (err) {
      setMsg(err?.message || "❌ Failed")
    }

  }

  return(

    <div style={{maxWidth:"400px",margin:"100px auto"}}>

      <h2>Create First Admin</h2>

      <input placeholder="Name"
        value={name}
        onChange={e=>setName(e.target.value)}
        style={input}
      />

      <input placeholder="Email"
        value={email}
        onChange={e=>setEmail(e.target.value)}
        style={input}
      />

      <input placeholder="Password"
        type="password"
        value={password}
        onChange={e=>setPassword(e.target.value)}
        style={input}
      />

      <button onClick={create} style={btn}>
        Create Admin
      </button>

      <p>{msg}</p>

    </div>

  )

}

const input = {
  width:"100%",
  padding:"10px",
  marginTop:"10px"
}

const btn = {
  marginTop:"15px",
  padding:"10px",
  width:"100%"
}
