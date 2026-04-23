"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {

  const [products,setProducts] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    fetch("/api/products")
      .then(res=>res.json())
      .then(data=>{
        setProducts(data.products || []);
        setLoading(false);
      });
  },[]);

  if(loading) return <p>Loading...</p>;

  return (
    <div className="container">

      <h1>All Products</h1>

      <div className="grid">
        {products.map(p=>(
          <Link key={p._id} href={`/products/${p.slug}`} className="card">

            <img src={p.images?.[0]} />

            <h3>{p.name}</h3>

            <p>₹{p.sellingPrice}</p>

          </Link>
        ))}
      </div>

      <style jsx>{`
        .container{max-width:1200px;margin:auto}
        .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
        .card{border:1px solid #eee;padding:10px}
        img{width:100%}
      `}</style>

    </div>
  );
}
