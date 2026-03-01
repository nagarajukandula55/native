export default function Home() {
  return (
    <main className="min-h-screen bg-[#fdf6ec]">

      {/* HERO SECTION */}
      <section className="text-center py-20 px-6">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to Our Store
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Premium Quality Products. Best Prices. Fast Delivery.
        </p>
        <button className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition">
          Shop Now
        </button>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="px-6 py-16 bg-white">
        <h2 className="text-3xl font-semibold text-center mb-10">
          Featured Products
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="border p-6 rounded-lg text-center shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-medium mb-2">Product 1</h3>
            <p className="text-gray-500 mb-4">₹999</p>
            <button className="bg-black text-white px-4 py-2 rounded">
              View
            </button>
          </div>

          <div className="border p-6 rounded-lg text-center shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-medium mb-2">Product 2</h3>
            <p className="text-gray-500 mb-4">₹1499</p>
            <button className="bg-black text-white px-4 py-2 rounded">
              View
            </button>
          </div>

          <div className="border p-6 rounded-lg text-center shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-medium mb-2">Product 3</h3>
            <p className="text-gray-500 mb-4">₹1999</p>
            <button className="bg-black text-white px-4 py-2 rounded">
              View
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white text-center py-6">
        © 2026 Your Brand. All rights reserved.
      </footer>

    </main>
  );
}
