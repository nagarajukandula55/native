import Link from "next/link";

export default function ProductCard({ product }: any) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg p-4">
      <h3 className="font-bold text-lg">{product.name}</h3>
      <p className="text-gray-600 mb-2">${product.price}</p>
      <Link
        href={`/products/${product._id}`}
        className="text-blue-600"
      >
        View Details
      </Link>
    </div>
  );
}
