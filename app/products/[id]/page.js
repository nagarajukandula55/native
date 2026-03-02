export default function ProductDetails({ params }) {
  const products = [
    {
      id: "1",
      name: "A2 Desi Cow Ghee",
      price: 1299,
      description:
        "Pure A2 cow ghee prepared using traditional bilona method.",
      image:
        "https://images.unsplash.com/photo-1585238342028-4e7c17a94c1a",
    },
    {
      id: "2",
      name: "Cold Pressed Groundnut Oil",
      price: 899,
      description:
        "Wood pressed oil retaining all nutrients and natural aroma.",
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950",
    },
    {
      id: "3",
      name: "Organic Turmeric Powder",
      price: 499,
      description:
        "Naturally grown turmeric with high curcumin content.",
      image:
        "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec",
    },
  ];

  const product = products.find((p) => p.id === params.id);

  if (!product) {
    return <h1 style={{ padding: "100px" }}>Product Not Found</h1>;
  }

  return (
    <div
      style={{
        padding: "100px 60px",
        backgroundColor: "#f4efe6",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "60px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "450px",
            borderRadius: "15px",
            objectFit: "cover",
          }}
        />

        <div>
          <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>
            {product.name}
          </h1>

          <p style={{ fontSize: "20px", marginBottom: "20px" }}>
            ₹{product.price}
          </p>

          <p style={{ fontSize: "18px", marginBottom: "30px" }}>
            {product.description}
          </p>

          <button
            style={{
              padding: "12px 35px",
              borderRadius: "25px",
              border: "none",
              backgroundColor: "#c28b45",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
