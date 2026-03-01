export default function HomePage() {
  return (
    <div className="text-center py-20">
      <h2 className="text-5xl font-bold mb-6">
        Modern Ecommerce Platform
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Built with Next.js 14 & TailwindCSS
      </p>
      <a
        href="/products"
        className="bg-black text-white px-6 py-3 rounded-lg"
      >
        Shop Now
      </a>
    </div>
  );
}
