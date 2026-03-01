async function getProduct(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
    { cache: "no-store" }
  );
  return res.json();
}

export default async function ProductDetail({
  params
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  return (
    <div>
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="text-xl text-gray-700 mt-4">
        ${product.price}
      </p>
      <p className="mt-4">{product.description}</p>
    </div>
  );
}
