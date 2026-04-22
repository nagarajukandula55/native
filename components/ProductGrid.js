import ProductCard from "./ProductCard";

export default function ProductGrid({ products }) {
  return (
    <div className="grid">
      {products.map((p) => (
        <ProductCard key={p._id || p.id} product={p} />
      ))}

      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
      `}</style>
    </div>
  );
}
