
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function ProductsPage() {

  const [products, setProducts] = useState([])

  useEffect(()=>{

    async function load(){

      const res = await fetch("/api/admin/products")
      const data = await res.json()

      setProducts(data)

    }

    load()

  },[])

  return(

    <div style={{maxWidth:"1200px", margin:"auto", padding:"20px"}}>

      <h1 style={{fontSize:"28px", fontWeight:"bold", marginBottom:"30px"}}>
        Our Products
      </h1>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",
        gap:"20px"
      }}>

        {products.map(product=> (

          <Link key={product._id} href={"/products/"+product.slug}>

            <div style={{
              border:"1px solid #ddd",
              borderRadius:"8px",
              overflow:"hidden"
            }}>

              <img
                src={product.image}
                alt={product.name}
                style={{
                  width:"100%",
                  height:"200px",
                  objectFit:"cover"
                }}
              />

              <div style={{padding:"12px"}}>

                <h3>{product.name}</h3>

                <p style={{color:"#777"}}>
                  {product.category}
                </p>

                <b>₹{product.price}</b>

              </div>

            </div>

          </Link>

        ))}

      </div>

    </div>

  )

}
