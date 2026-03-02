export default function OrderSuccessPage() {
  return (
    <div
      style={{
        padding: "80px 60px",
        minHeight: "100vh",
        textAlign: "center",
        fontFamily: "'Georgia', serif",
        backgroundColor: "#f4efe6",
      }}
    >
      <h1 style={{ fontSize: "40px", color: "#2e7d32", marginBottom: "20px" }}>
        🎉 Order Placed Successfully!
      </h1>

      <p style={{ marginTop: "20px", fontSize: "18px", color: "#3a2a1c" }}>
        Your order has been received successfully.
      </p>

      <p style={{ marginTop: "30px", fontSize: "16px", color: "#5c4634" }}>
        We will contact you shortly regarding payment and delivery.
      </p>

      <a
        href="/"
        style={{
          display: "inline-block",
          marginTop: "40px",
          padding: "12px 30px",
          borderRadius: "25px",
          border: "none",
          backgroundColor: "#c28b45",
          color: "#fff",
          cursor: "pointer",
          textDecoration: "none",
          fontSize: "16px",
        }}
      >
        Continue Shopping
      </a>
    </div>
  );
}
