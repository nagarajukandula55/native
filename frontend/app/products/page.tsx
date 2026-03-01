import ProductCard from "@/components/ProductCard";

async function getProducts() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
    { cache: "no-store" }
  );
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {products.map((p: any) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}
