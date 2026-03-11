import AddToCartButton from "@/components/AddToCartButton"
async function getProduct(slug){

  const res = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + "/api/admin/products/" + slug,
    { cache:"no-store" }
  )

  return res.json()

}

export default async function ProductPage({params}){

  const product = await getProduct(params.slug)

  return(

    <div style={{
      maxWidth:"1100px",
      margin:"auto",
      padding:"40px",
      display:"grid",
      gridTemplateColumns:"1fr 1fr",
      gap:"40px"
    }}>

      <img
        src={product.image}
        alt={product.name}
        style={{
          width:"100%",
          maxWidth:"450px",
          height:"450px",
          objectFit:"cover",
          borderRadius:"8px"
        }}
      />
        <AddToCartButton product={product} />

      <div>

        <h1 style={{fontSize:"30px", fontWeight:"bold"}}>
          {product.name}
        </h1>

        <p style={{marginTop:"15px"}}>
          {product.description}
        </p>

        <h2 style={{marginTop:"20px"}}>
          ₹{product.price}
        </h2>

      </div>

    </div>

  )

}
