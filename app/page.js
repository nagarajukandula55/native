export default function Home() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#fdf6ec" }}>

      <section style={{ textAlign: "center", padding: "80px 20px" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "20px" }}>
          Welcome to Our Store
        </h1>
        <p style={{ fontSize: "18px", color: "#555", marginBottom: "30px" }}>
          Premium Quality Products. Best Prices. Fast Delivery.
        </p>
        <button style={{
          backgroundColor: "black",
          color: "white",
          padding: "12px 30px",
          borderRadius: "30px",
          border: "none",
          cursor: "pointer"
        }}>
          Shop Now
        </button>
      </section>

      <section style={{ padding: "60px 20px", backgroundColor: "white" }}>
        <h2 style={{ textAlign: "center", fontSize: "32px", marginBottom: "40px" }}>
          Featured Products
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px"
        }}>
          {[1,2,3].map((item) => (
            <div key={item} style={{
              border: "1px solid #ddd",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center"
            }}>
              <h3>Product {item}</h3>
              <p style={{ color: "#777" }}>₹{item * 500}</p>
              <button style={{
                backgroundColor: "black",
                color: "white",
                padding: "8px 20px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer"
              }}>
                View
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer style={{
        backgroundColor: "black",
        color: "white",
        textAlign: "center",
        padding: "20px"
      }}>
        © 2026 Native. All rights reserved.
      </footer>

    </main>
  );
}
