import Image from "next/image";

export async function generateMetadata({ params }) {
  const res = await fetch(`https://shopnative.in/api/products/${params.slug}`);
  const data = await res.json();

  return {
    title: data.product.name,
    description: data.product.shortDescription,
  };
}

export default async function ProductPage({ params }) {

  const res = await fetch(`https://shopnative.in/api/products/${params.slug}`);
  const data = await res.json();

  const p = data.product;
  const variants = data.variants;

  return (
    <div className="container">

      <div className="grid">

        <div>
          <Image src={p.images?.[0]} width={400} height={400} alt="" />
        </div>

        <div>

          <h1>{p.name}</h1>
          <p>{p.shortDescription}</p>

          <h2>₹{p.sellingPrice}</h2>

          <div>
            {variants.map(v=>(
              <a key={v._id} href={`/products/${v.slug}`}>
                {v.variant}
              </a>
            ))}
          </div>

          <button>Buy Now</button>

        </div>

      </div>

    </div>
  );
}
