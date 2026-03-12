"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useCart } from "@/context/CartContext"
import { useSearchParams } from "next/navigation"

export default function ProductsPage() {

  const { addToCart } = useCart()

  const searchParams = useSearchParams()
  const search = searchParams.get("search")

  const [products,setProducts] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{

    const fetchProducts = async()=>{

      try{

        const res = await fetch("/api/admin/products")
        const data = await res.json()

        setProducts(data)

      }catch(err){
        console.log("Product fetch error:",err)
      }
      finally{
        setLoading(false)
      }

    }

    fetchProducts()

  },[])


  /* SEARCH FILTER */

  const filteredProducts = products.filter(product =>
    !search ||
    product.name.toLowerCase().includes(search.toLowerCase())
  )


  return(

    <div
    style={{
      maxWidth:"1300px",
      margin:"auto",
      padding:"60px 20px"
    }}
    >

      <h1
      style={{
        fontSize:"42px",
        marginBottom:"10px",
        textAlign:"center"
      }}
      >
        Our Products
      </h1>


      {search && (

        <p
        style={{
          textAlign:"center",
          marginBottom:"30px",
          color:"#777"
        }}
        >
          Showing results for "<b>{search}</b>"
        </p>

      )}


      {loading ? (

        <p style={{textAlign:"center"}}>Loading products...</p>

      ) : filteredProducts.length === 0 ? (

        <p style={{textAlign:"center"}}>No products found</p>

      ) : (

        <div
        style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
          gap:"30px"
        }}
        >

          {filteredProducts.map((product)=>(

            <div
            key={product._id}
            style={{
              border:"1px solid #eee",
              borderRadius:"12px",
              overflow:"hidden",
              background:"#fff",
              transition:"0.3s",
              boxShadow:"0 5px 20px rgba(0,0,0,0.05)"
            }}
            >

              {/* PRODUCT IMAGE */}

              <Link href={`/product/${product.slug}`}>

                <img
                src={product.image}
                alt={product.name}
                style={{
                  width:"100%",
                  height:"220px",
                  objectFit:"cover"
                }}
                />

              </Link>


              {/* PRODUCT INFO */}

              <div style={{padding:"18px"}}>

                <Link
                href={`/product/${product.slug}`}
                style={{textDecoration:"none"}}
                >

                  <h3
                  style={{
                    fontSize:"18px",
                    marginBottom:"10px",
                    color:"#333"
                  }}
                  >
                    {product.name}
                  </h3>

                </Link>


                <p
                style={{
                  color:"#777",
                  fontSize:"14px",
                  marginBottom:"12px"
                }}
                >
                  {product.description?.slice(0,60) || "Natural healthy product"}
                </p>


                <div
                style={{
                  display:"flex",
                  justifyContent:"space-between",
                  alignItems:"center"
                }}
                >

                  <span
                  style={{
                    fontSize:"18px",
                    fontWeight:"600",
                    color:"#c28b45"
                  }}
                  >
                    ₹{product.price}
                  </span>


                  <button
                  onClick={()=>addToCart(product)}
                  style={{
                    padding:"8px 16px",
                    border:"none",
                    borderRadius:"20px",
                    background:"#c28b45",
                    color:"#fff",
                    cursor:"pointer",
                    fontSize:"14px"
                  }}
                  >
                    Add
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  )

}
