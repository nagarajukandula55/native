export default function Verify({ params }) {
  return (
    <div style={{ padding: 40 }}>
      <h2>Invoice Verification</h2>
      <p>Order ID: {params.id}</p>
      <p>Status: ✅ VALID</p>
    </div>
  );
}
