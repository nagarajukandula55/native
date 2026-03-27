export default function Unauthorized() {
  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1 style={{ fontSize: 28, color: "#ef4444" }}>❌ Access Denied</h1>
      <p>You do not have permission to access this page.</p>
      <a href="/" style={{ color: "#2563eb" }}>Go Home</a>
    </div>
  );
}
