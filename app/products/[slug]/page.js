
import Image from "next/image"

async function getProduct(slug) {

  const res = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + "/api/admin/products/" + slug,
    { cache: "no-store" }
  )

  return res.json()

}

export default async function ProductPage({ params }) {

  const product = await getProduct(params.slug)

  return (

    <div className="max-w-6xl mx-auto p-8 grid md:grid-cols-2 gap-10">

      {/* IMAGE */}

      <div className="relative w-full h-[450px] border rounded">

        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="500px"
          className="object-cover"
        />

      </div>

      {/* DETAILS */}

      <div>

        <h1 className="text-3xl font-bold mb-4">
          {product.name}
        </h1>

        <p className="text-gray-600 mb-4">
          {product.description}
        </p>

        <p className="text-2xl font-bold text-green-700 mb-4">
          ₹{product.price}
        </p>

        <p className="text-sm text-gray-500">
          Category: {product.category}
        </p>

      </div>

    </div>

  )

}
